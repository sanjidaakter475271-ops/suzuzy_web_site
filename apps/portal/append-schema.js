const fs = require('fs');
const path = require('path');

const models = `
// ==========================================
// BETTER AUTH MODELS
// ==========================================

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime
  updatedAt             DateTime

  @@map("account")
  @@schema("public")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime
  updatedAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("session")
  @@schema("public")
}

model User {
  id            String    @id
  name          String?
  email         String    @unique
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]

  // Custom fields for Suzuky
  role          String?
  roleId        String?   @db.Uuid
  dealerId      String?   @db.Uuid

  @@map("user")
  @@schema("public")
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime?
  updatedAt  DateTime?

  @@map("verification")
  @@schema("public")
}
`;

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
fs.appendFileSync(schemaPath, models);
console.log('Appended Better Auth models successfully.');
