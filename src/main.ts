import { spawn } from 'child_process';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import * as path from 'path';
import * as os from 'os';

const banner = `
██████  ███████  ██████  ██  ██████  ███    ██      █████  ██████  ██ 
██   ██ ██      ██       ██ ██    ██ ████   ██     ██   ██ ██   ██ ██ 
██████  █████   ██   ███ ██ ██    ██ ██ ██  ██     ███████ ██████  ██ 
██   ██ ██      ██    ██ ██ ██    ██ ██  ██ ██     ██   ██ ██      ██ 
██   ██ ███████  ██████  ██  ██████  ██   ████     ██   ██ ██      ██ 
`;

console.log(banner);

const parentDir = path.resolve(__dirname, '..');
const containerCommand = `${process.env.CONTAINER_TYPE}`;
const containerDownArgs = ['compose', 'down', `${(process.env.CONTAINER_REMOVE_VOLUMES)? '-v' : ''}`];
const containerServices = process.env.CONTAINER_SERVICES ? process.env.CONTAINER_SERVICES.split(',') : [];
const containerUpArgs = ['compose', 'up', '-d'];
const combinedArgs = [...containerUpArgs, ...containerServices];

async function bootstrap() {
  if (
    process.env.NODE_ENV === 'local' && process.env.CONTAINER_ENABLE === 'true'
  ) {
    await executeCommand(containerCommand, combinedArgs, { cwd: parentDir })
      .then(output => {
        console.log('Docker command output:\n', output);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    process.on('SIGINT', () => handleSignal('SIGINT'));
    process.on('SIGTERM', () => handleSignal('SIGTERM'));
  }

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Region API')
    .setDescription('API to work with Countries and States data.')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(parseInt(process.env.PORT as string, 10) || 3000);
}
bootstrap();

function executeCommand(command: string, args: string[] = [], options: { cwd?: string } = {}) {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    const release = os.release();
    const arch = os.arch();

    let finalArgs = args;

    if (platform === 'win32') {
      const [major, minor] = release.split('.').map(Number);
      if (major >= 10 && arch === 'x64') {
        finalArgs = ['/c', command, ...args];
        command = 'cmd.exe';
      } else {
        return reject(new Error('This script requires Windows 10 or higher with 64-bit architecture.'));
      }
    } else if (platform === 'linux' || platform === 'darwin') {
      finalArgs = ['-c', `${command} ${args.join(' ')}`];
      command = 'sh';
    }

    console.log(`Executing command "${command} ${finalArgs.join(' ')}" on path "${options.cwd}"`);
    const child = spawn(command, finalArgs, options);

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdoutData + stderrData);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderrData}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function cleanup() {
  if (process.env.NODE_ENV !== 'local') return;
  if (process.env.CONTAINER_STOP !== 'true') return;

  console.log('Performing cleanup tasks...');

  console.log('Executing command', containerCommand, containerDownArgs);
  await executeCommand(containerCommand, containerDownArgs, { cwd: parentDir })
    .then(output => {
      console.log('Docker command output:\n', output);
    })
    .catch(error => {
      console.error('Error:', error);
    });

  console.log('Cleanup complete.');
}

async function handleSignal(signal: string) {
  try {
    console.log(`Received signal: ${signal}. Cleaning up...`);
    await cleanup();
  } catch (error) {
    console.error('Error executing command:', error);
  } finally {
    console.log('Process ended - just hit enter');
    process.exit(0);
  }
}
