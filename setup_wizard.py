#!/usr/bin/env python3
"""
DIRK Brain Portal - Interactive Setup Wizard
Comprehensive installation and configuration assistant
"""

import os
import sys
import json
import subprocess
import platform
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import time

class DirkSetupWizard:
    """Interactive setup wizard for DIRK Brain Portal"""
    
    def __init__(self):
        self.config = {}
        self.platform = platform.system()
        self.base_path = Path(__file__).parent
        self.frontend_path = self.base_path / "frontend"
        self.backend_path = self.base_path / "backend"
        
    def display_banner(self):
        """Display welcome banner"""
        banner = """
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     ██████╗ ██╗██████╗ ██╗  ██╗    ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
║     ██╔══██╗██║██╔══██╗██║ ██╔╝    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
║     ██║  ██║██║██████╔╝█████╔╝     ██████╔╝██████╔╝███████║██║██╔██╗ ██║
║     ██║  ██║██║██╔══██╗██╔═██╗     ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
║     ██████╔╝██║██║  ██║██║  ██╗    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
║     ╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
║                                                                    ║
║                 AI Agent Orchestration Platform                    ║
║                      Setup Wizard v1.0                            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
        """
        print("\033[96m" + banner + "\033[0m")
        print("\n🚀 Welcome to DIRK Brain Portal Setup Wizard!")
        print("This wizard will guide you through the installation process.\n")
        
    def check_prerequisites(self) -> Dict[str, bool]:
        """Check system prerequisites"""
        print("📋 Checking prerequisites...")
        prerequisites = {}
        
        # Check Node.js
        try:
            node_version = subprocess.check_output(["node", "--version"], text=True).strip()
            prerequisites["Node.js"] = True
            print(f"  ✅ Node.js: {node_version}")
        except:
            prerequisites["Node.js"] = False
            print("  ❌ Node.js: Not found")
        
        # Check Python
        try:
            python_version = sys.version.split()[0]
            prerequisites["Python"] = sys.version_info >= (3, 8)
            if prerequisites["Python"]:
                print(f"  ✅ Python: {python_version}")
            else:
                print(f"  ⚠️  Python: {python_version} (3.8+ required)")
        except:
            prerequisites["Python"] = False
            print("  ❌ Python: Not found")
        
        # Check Git
        try:
            git_version = subprocess.check_output(["git", "--version"], text=True).strip()
            prerequisites["Git"] = True
            print(f"  ✅ Git: {git_version}")
        except:
            prerequisites["Git"] = False
            print("  ❌ Git: Not found")
        
        # Check Docker (optional)
        try:
            docker_version = subprocess.check_output(["docker", "--version"], text=True).strip()
            prerequisites["Docker"] = True
            print(f"  ✅ Docker: {docker_version} (optional)")
        except:
            prerequisites["Docker"] = False
            print("  ⚠️  Docker: Not found (optional for containerized agents)")
        
        # Check pnpm (preferred) or npm
        try:
            pnpm_version = subprocess.check_output(["pnpm", "--version"], text=True).strip()
            prerequisites["Package Manager"] = "pnpm"
            print(f"  ✅ pnpm: {pnpm_version}")
        except:
            try:
                npm_version = subprocess.check_output(["npm", "--version"], text=True).strip()
                prerequisites["Package Manager"] = "npm"
                print(f"  ✅ npm: {npm_version}")
            except:
                prerequisites["Package Manager"] = False
                print("  ❌ Package Manager: Neither pnpm nor npm found")
        
        return prerequisites
    
    def prompt_user(self, message: str, default: str = "") -> str:
        """Prompt user for input"""
        if default:
            response = input(f"\n{message} [{default}]: ").strip()
            return response if response else default
        else:
            return input(f"\n{message}: ").strip()
    
    def prompt_choice(self, message: str, choices: List[str]) -> str:
        """Prompt user to select from choices"""
        print(f"\n{message}")
        for i, choice in enumerate(choices, 1):
            print(f"  {i}. {choice}")
        
        while True:
            try:
                selection = int(input("Select option (number): "))
                if 1 <= selection <= len(choices):
                    return choices[selection - 1]
            except:
                pass
            print("Invalid selection. Please try again.")
    
    def configure_environment(self):
        """Configure environment settings"""
        print("\n⚙️  Configuration Setup")
        print("-" * 50)
        
        # Installation type
        install_type = self.prompt_choice(
            "Select installation type:",
            ["Development (local)", "Production (optimized)", "Docker (containerized)"]
        )
        self.config["install_type"] = install_type.split()[0].lower()
        
        # API Provider configuration
        print("\n🤖 AI Provider Configuration")
        print("Configure your AI providers (press Enter to skip):")
        
        providers = {}
        
        # Anthropic Claude
        claude_key = self.prompt_user("Anthropic API Key (for Claude)", "")
        if claude_key:
            providers["anthropic"] = {"api_key": claude_key, "enabled": True}
        
        # OpenAI
        openai_key = self.prompt_user("OpenAI API Key (for GPT)", "")
        if openai_key:
            providers["openai"] = {"api_key": openai_key, "enabled": True}
        
        # Google Gemini
        gemini_key = self.prompt_user("Google API Key (for Gemini)", "")
        if gemini_key:
            providers["google"] = {"api_key": gemini_key, "enabled": True}
        
        self.config["providers"] = providers
        
        # Project sources
        print("\n📁 Project Sources Configuration")
        local_projects_path = self.prompt_user(
            "Local projects directory",
            "~/projects"
        )
        self.config["project_sources"] = [{
            "type": "local",
            "path": os.path.expanduser(local_projects_path),
            "enabled": True
        }]
        
        # GitHub integration
        github_username = self.prompt_user("GitHub username (optional)", "")
        if github_username:
            github_token = self.prompt_user("GitHub personal access token (optional)", "")
            self.config["project_sources"].append({
                "type": "github",
                "username": github_username,
                "api_key": github_token,
                "enabled": True
            })
        
        # Database configuration
        print("\n🗄️  Database Configuration")
        db_type = self.prompt_choice(
            "Select database type:",
            ["SQLite (local)", "PostgreSQL", "Supabase (cloud)"]
        )
        
        if "PostgreSQL" in db_type:
            self.config["database"] = {
                "type": "postgresql",
                "host": self.prompt_user("Database host", "localhost"),
                "port": self.prompt_user("Database port", "5432"),
                "name": self.prompt_user("Database name", "dirk_brain"),
                "user": self.prompt_user("Database user", "postgres"),
                "password": self.prompt_user("Database password", "")
            }
        elif "Supabase" in db_type:
            self.config["database"] = {
                "type": "supabase",
                "url": self.prompt_user("Supabase URL", ""),
                "anon_key": self.prompt_user("Supabase anon key", "")
            }
        else:
            self.config["database"] = {"type": "sqlite", "path": "./data/dirk.db"}
        
        # Port configuration
        print("\n🔌 Port Configuration")
        self.config["ports"] = {
            "frontend": int(self.prompt_user("Frontend port", "3000")),
            "backend": int(self.prompt_user("Backend port", "3001")),
            "grpc": int(self.prompt_user("gRPC port", "50051")),
            "websocket": int(self.prompt_user("WebSocket port", "8080"))
        }
    
    def install_dependencies(self):
        """Install project dependencies"""
        print("\n📦 Installing Dependencies")
        print("-" * 50)
        
        pkg_manager = "pnpm" if shutil.which("pnpm") else "npm"
        
        # Frontend dependencies
        print("\n📦 Installing frontend dependencies...")
        try:
            subprocess.run(
                [pkg_manager, "install"],
                cwd=self.frontend_path,
                check=True
            )
            print("  ✅ Frontend dependencies installed")
        except Exception as e:
            print(f"  ❌ Frontend installation failed: {e}")
            return False
        
        # Backend dependencies
        print("\n📦 Installing backend dependencies...")
        try:
            # Create virtual environment
            subprocess.run(
                [sys.executable, "-m", "venv", "venv"],
                cwd=self.backend_path,
                check=True
            )
            
            # Install Python packages
            pip_path = self.backend_path / "venv" / ("Scripts" if self.platform == "Windows" else "bin") / "pip"
            subprocess.run(
                [str(pip_path), "install", "-r", "requirements.txt"],
                cwd=self.backend_path,
                check=True
            )
            print("  ✅ Backend dependencies installed")
        except Exception as e:
            print(f"  ❌ Backend installation failed: {e}")
            return False
        
        return True
    
    def create_env_files(self):
        """Create environment configuration files"""
        print("\n📝 Creating configuration files...")
        
        # Frontend .env.local
        frontend_env = f"""
# DIRK Brain Portal - Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:{self.config['ports']['backend']}
NEXT_PUBLIC_WS_URL=ws://localhost:{self.config['ports']['websocket']}
NEXT_PUBLIC_GRPC_URL=localhost:{self.config['ports']['grpc']}
"""
        
        if self.config.get("database", {}).get("type") == "supabase":
            frontend_env += f"""
NEXT_PUBLIC_SUPABASE_URL={self.config['database'].get('url', '')}
NEXT_PUBLIC_SUPABASE_ANON_KEY={self.config['database'].get('anon_key', '')}
"""
        
        with open(self.frontend_path / ".env.local", "w") as f:
            f.write(frontend_env)
        print("  ✅ Created frontend/.env.local")
        
        # Backend .env
        backend_env = f"""
# DIRK Brain Portal - Backend Configuration
PORT={self.config['ports']['backend']}
GRPC_PORT={self.config['ports']['grpc']}
WS_PORT={self.config['ports']['websocket']}
ENVIRONMENT={self.config['install_type']}
"""
        
        # Add provider keys
        for provider, settings in self.config.get("providers", {}).items():
            if settings.get("api_key"):
                key_name = f"{provider.upper()}_API_KEY"
                backend_env += f"{key_name}={settings['api_key']}\n"
        
        # Add database configuration
        db = self.config.get("database", {})
        if db.get("type") == "postgresql":
            backend_env += f"""
DATABASE_URL=postgresql://{db['user']}:{db['password']}@{db['host']}:{db['port']}/{db['name']}
"""
        elif db.get("type") == "supabase":
            backend_env += f"""
SUPABASE_URL={db.get('url', '')}
SUPABASE_SERVICE_KEY={db.get('service_key', '')}
"""
        
        with open(self.backend_path / ".env", "w") as f:
            f.write(backend_env)
        print("  ✅ Created backend/.env")
        
        # Save full configuration
        with open(self.base_path / "dirk.config.json", "w") as f:
            json.dump(self.config, f, indent=2)
        print("  ✅ Created dirk.config.json")
    
    def initialize_database(self):
        """Initialize database"""
        print("\n🗄️  Initializing Database")
        print("-" * 50)
        
        db_type = self.config.get("database", {}).get("type", "sqlite")
        
        if db_type == "sqlite":
            # Create data directory
            data_dir = self.base_path / "data"
            data_dir.mkdir(exist_ok=True)
            print("  ✅ SQLite database initialized")
        
        elif db_type in ["postgresql", "supabase"]:
            print("  ℹ️  Running database migrations...")
            try:
                # Run Prisma migrations
                subprocess.run(
                    ["npx", "prisma", "migrate", "deploy"],
                    cwd=self.backend_path,
                    check=True
                )
                print("  ✅ Database migrations completed")
            except:
                print("  ⚠️  Database migration failed - manual setup may be required")
    
    def create_startup_scripts(self):
        """Create startup scripts"""
        print("\n📜 Creating startup scripts...")
        
        # Create start.sh for Unix
        start_sh = """#!/bin/bash
# DIRK Brain Portal - Startup Script

echo "🚀 Starting DIRK Brain Portal..."

# Start backend services
echo "Starting backend services..."
cd backend
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
python godmode_server.py &
GRPC_PID=$!
python main.py &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
pnpm dev &
FRONTEND_PID=$!
cd ..

echo "✅ DIRK Brain Portal is running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  gRPC Server: localhost:50051"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait and handle shutdown
trap "kill $GRPC_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
"""
        
        with open(self.base_path / "start.sh", "w") as f:
            f.write(start_sh)
        os.chmod(self.base_path / "start.sh", 0o755)
        print("  ✅ Created start.sh")
        
        # Create start.bat for Windows
        start_bat = """@echo off
REM DIRK Brain Portal - Startup Script

echo Starting DIRK Brain Portal...

REM Start backend services
echo Starting backend services...
cd backend
start /b cmd /c "venv\\Scripts\\activate && python godmode_server.py"
start /b cmd /c "venv\\Scripts\\activate && python main.py"
cd ..

REM Start frontend
echo Starting frontend...
cd frontend
start /b cmd /c "pnpm dev"
cd ..

echo DIRK Brain Portal is running!
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001
echo   gRPC Server: localhost:50051
echo.
echo Press Ctrl+C to stop all services
pause
"""
        
        with open(self.base_path / "start.bat", "w") as f:
            f.write(start_bat)
        print("  ✅ Created start.bat")
    
    def display_completion(self):
        """Display completion message"""
        print("\n" + "=" * 70)
        print("🎉 DIRK Brain Portal Setup Complete!")
        print("=" * 70)
        
        print("\n📋 Configuration Summary:")
        print(f"  • Installation Type: {self.config['install_type']}")
        print(f"  • Frontend Port: {self.config['ports']['frontend']}")
        print(f"  • Backend Port: {self.config['ports']['backend']}")
        print(f"  • Database: {self.config['database']['type']}")
        print(f"  • AI Providers: {', '.join(self.config.get('providers', {}).keys()) or 'None configured'}")
        
        print("\n🚀 To start DIRK Brain Portal:")
        if self.platform == "Windows":
            print("  Run: .\\start.bat")
        else:
            print("  Run: ./start.sh")
        
        print("\n📚 Resources:")
        print("  • Tutorial: Open tutorial.html in your browser")
        print("  • Architecture: View architecture.html for system design")
        print("  • Documentation: https://github.com/your-repo/dirk-brain-portal")
        
        print("\n💡 Quick Commands:")
        print("  • Generate agents: Use the AI prompt box at the bottom")
        print("  • Switch views: Ctrl+Space (Command/Monitor/Hybrid)")
        print("  • Deploy agents: Drag agents onto projects")
        
        print("\n🔒 Security Note:")
        print("  Run 'curl -X POST http://localhost:3001/api/security/full-report'")
        print("  to generate a security report for your projects")
        
        print("\n" + "=" * 70)
        print("Thank you for installing DIRK Brain Portal! 🎯")
    
    def run(self):
        """Run the setup wizard"""
        self.display_banner()
        
        # Check prerequisites
        prerequisites = self.check_prerequisites()
        
        if not prerequisites["Node.js"] or not prerequisites["Python"]:
            print("\n❌ Missing required prerequisites. Please install Node.js and Python 3.8+")
            return False
        
        if not prerequisites.get("Package Manager"):
            print("\n❌ No package manager found. Please install pnpm or npm")
            return False
        
        # Configure environment
        self.configure_environment()
        
        # Confirm installation
        print("\n" + "=" * 50)
        print("Ready to install DIRK Brain Portal")
        print("=" * 50)
        
        confirm = self.prompt_user("Proceed with installation? (y/n)", "y")
        if confirm.lower() != 'y':
            print("Installation cancelled.")
            return False
        
        # Install dependencies
        if not self.install_dependencies():
            print("\n❌ Installation failed. Please check the errors above.")
            return False
        
        # Create configuration files
        self.create_env_files()
        
        # Initialize database
        self.initialize_database()
        
        # Create startup scripts
        self.create_startup_scripts()
        
        # Display completion
        self.display_completion()
        
        return True

if __name__ == "__main__":
    wizard = DirkSetupWizard()
    success = wizard.run()
    sys.exit(0 if success else 1)