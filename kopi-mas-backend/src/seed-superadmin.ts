import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserHelpersService } from './modules/users/services/user-helpers.service';
import { UserRole } from './modules/users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserHelpersService);

  const email = 'admin@kopimas.com';
  const password = 'admin123';
  const fullName = 'Super Admin';

  const existingUser = await userService.findByEmail(email);
  if (existingUser) {
    console.log('Superadmin user already exists');
    await app.close();
    return;
  }

  const user = await userService.create(
    {
      username: 'admin',
      email: email,
      fullName: fullName,
      phone: '081234567890',
      role: UserRole.SYSTEM_ADMIN,
      isActive: true,
    },
    password
  );

  console.log('Superadmin user created successfully!');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Role:', UserRole.SYSTEM_ADMIN);

  await app.close();
}

bootstrap();
