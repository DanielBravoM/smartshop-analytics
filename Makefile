.PHONY: help start stop restart rebuild status logs clean urls setup

help:
	@echo "SmartShop Analytics - Comandos disponibles:"
	@echo ""
	@echo "  make start    - Iniciar todo el sistema"
	@echo "  make stop     - Parar todo el sistema"
	@echo "  make restart  - Reiniciar todo el sistema"
	@echo "  make rebuild  - Reconstruir todo desde cero"
	@echo "  make status   - Ver estado de servicios"
	@echo "  make logs     - Ver logs en tiempo real"
	@echo "  make clean    - Limpiar todo (⚠️  elimina datos)"
	@echo "  make urls     - Mostrar URLs de acceso"
	@echo "  make setup    - Setup inicial (crear usuarios)"
	@echo ""

start:
	@echo "🚀 Iniciando SmartShop Analytics..."
	docker-compose up -d
	@echo "✅ Sistema iniciado"
	@make urls

stop:
	@echo "🛑 Deteniendo SmartShop Analytics..."
	docker-compose down
	@echo "✅ Sistema detenido"

restart:
	@echo "🔄 Reiniciando SmartShop Analytics..."
	docker-compose restart
	@echo "✅ Sistema reiniciado"

rebuild:
	@echo "🔨 Reconstruyendo SmartShop Analytics..."
	docker-compose down
	docker-compose up -d --build
	@echo "✅ Sistema reconstruido"
	@make urls

status:
	@echo "📊 Estado de los servicios:"
	@docker-compose ps

logs:
	@echo "📝 Logs en tiempo real (Ctrl+C para salir)..."
	@docker-compose logs -f

clean:
	@echo "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos"
	@read -p "¿Estás seguro? (y/N): " confirm && [ $$confirm = y ]
	docker-compose down -v
	docker system prune -f
	@echo "✅ Sistema limpio"

urls:
	@echo ""
	@echo "╔═══════════════════════════════════════╗"
	@echo "║        ACCESOS AL SISTEMA            ║"
	@echo "╚═══════════════════════════════════════╝"
	@echo ""
	@echo "🌐 Frontend:           http://localhost:8080"
	@echo "🔧 API Gateway:        http://localhost:3000"
	@echo "📊 Analytics:          http://localhost:4000"
	@echo "🗄️  pgAdmin:           http://localhost:5050"
	@echo "🍃 Mongo Express:      http://localhost:8081"
	@echo ""
	@echo "Credenciales:"
	@echo "  Admin: admin@smartshop.com / password123"
	@echo "  Usuario: user@smartshop.com / password123"
	@echo ""

setup:
	@echo "⚙️  Configurando usuarios iniciales..."
	@sleep 5
	@curl -X POST http://localhost:3000/api/v1/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"admin@smartshop.com","password":"password123","name":"Admin User"}' \
		2>/dev/null
	@curl -X POST http://localhost:3000/api/v1/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"user@smartshop.com","password":"password123","name":"Normal User"}' \
		2>/dev/null
	@docker exec smartshop-postgres psql -U admin -d smartshop \
		-c "UPDATE users SET role = 'admin' WHERE email = 'admin@smartshop.com';" \
		2>/dev/null
	@echo "✅ Usuarios creados"