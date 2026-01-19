
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Try to load .env files
const paths = [
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../.env')
];

let added = 0;
paths.forEach(p => {
    if (fs.existsSync(p)) {
        console.log('Loading env from:', p);
        const envConfig = fs.readFileSync(p, 'utf-8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value && !process.env[key.trim()]) {
                process.env[key.trim()] = value.trim();
                added++;
            }
        });
    }
});

if (added === 0) {
    console.warn('No .env files loaded. Relying on system env vars.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySignup() {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    const password = 'TestPassword123!';
    const fullName = 'Test Customer ' + timestamp;
    const phone = '+88017' + timestamp.toString().slice(-8); // Ensure valid-ish phone

    console.log(`Starting verification for user: ${email}`);

    // 1. Sign Up
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                fullName: fullName,
                phone: phone
            }
        }
    });

    if (signUpError) {
        console.error('SignUp Failed:', signUpError.message);
        return;
    }

    if (!user) {
        console.error('SignUp succeeded but no user returned.');
        return;
    }

    console.log('User created in Auth:', user.id);

    // 2. Check Profile (Wait a bit for trigger)
    console.log('Waiting for trigger to create profile...');
    await new Promise(r => setTimeout(r, 2000));

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Fetch Profile Failed:', profileError.message);
        return;
    }

    console.log('Profile found:', profile);

    // 3. Verify Role
    if (profile.role === 'customer') {
        console.log('SUCCESS: User has "customer" role.');
    } else {
        console.error(`FAILURE: expected role "customer", got "${profile.role}"`);
    }

    // 4. Verify no dealer record exists yet
    const { data: dealer } = await supabase
        .from('dealers')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

    if (!dealer) {
        console.log('SUCCESS: No dealer record linked yet (Correct for customer flow).');
    } else {
        console.error('FAILURE: Dealer record found unexpectedly:', dealer);
    }
}

verifySignup().catch(console.error);
