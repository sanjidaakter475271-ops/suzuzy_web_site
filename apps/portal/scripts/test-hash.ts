import argon2 from "argon2";

async function check() {
    const password = "passwor123";
    const hashInDb = "$argon2id$v=19$m=65536,t=3,p=1$E1D/nXgTa+5v3dNXrqmbYA$pO2PAqk2L+6++Vlb0NCGplVbHStIEWRY/epiT2c3zGQ";

    try {
        const isValid = await argon2.verify(hashInDb, password);
        console.log("Password matches hash:", isValid);

        const newHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1,
        });
        console.log("New hash for 'passwor123':", newHash);
    } catch (e) {
        console.error("Error:", e);
    }
}

check();
