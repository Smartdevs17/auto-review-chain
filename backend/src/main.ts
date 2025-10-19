import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const configService = app.get(ConfigService)

	// Enable CORS
	app.enableCors({
		origin: [
			'http://localhost:5173',
			'http://localhost:8080',
			'http://localhost:8081',
			'http://localhost:3000',
			'https://auto-review-chain.vercel.app',
			configService.get('CORS_ORIGIN')
		].filter(Boolean),
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	})

	// Global validation pipe
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
	}))

	// Swagger documentation
	const config = new DocumentBuilder()
		.setTitle(configService.get('SWAGGER_TITLE') || 'PeerAI API')
		.setDescription(configService.get('SWAGGER_DESCRIPTION') || 'Decentralized AI Peer Review Platform API')
		.setVersion(configService.get('SWAGGER_VERSION') || '1.0.0')
		.addBearerAuth()
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup(configService.get('SWAGGER_PATH') || 'api/docs', app, document)

	const port = configService.get('PORT') || 3001
	await app.listen(port)
	
	console.log(`🚀 PeerAI Backend running on: http://localhost:${port}`)
	console.log(`📚 API Documentation: http://localhost:${port}/api/docs`)

	// Graceful shutdown handling
	process.on('SIGTERM', async () => {
		console.log('SIGTERM received, shutting down gracefully')
		await app.close()
		process.exit(0)
	})

	process.on('SIGINT', async () => {
		console.log('SIGINT received, shutting down gracefully')
		await app.close()
		process.exit(0)
	})
}

bootstrap()
