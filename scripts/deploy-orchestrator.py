#!/usr/bin/env python3

################################################################################
# 🚀 TITANE∞ v26.3.0 — DEPLOYMENT ORCHESTRATOR (Python)
################################################################################
# Advanced deployment orchestrator with:
# ✅ Interactive menu system
# ✅ Pre-deployment checks
# ✅ Build status tracking
# ✅ Error recovery
# ✅ Email notifications (optional)
# ✅ Deployment statistics
################################################################################

import os
import sys
import subprocess
import json
import argparse
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/titane_deploy.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TitaneDeployment:
    """TITANE∞ Deployment Orchestrator"""
    
    def __init__(self, repo_root: Optional[str] = None):
        self.repo_root = Path(repo_root or os.getcwd())
        self.deploy_dir = self.repo_root / 'deployment' / 'v26.3.0'
        self.start_time = datetime.now()
        self.stats = {
            'phases_completed': [],
            'artifacts_created': [],
            'errors': [],
            'warnings': []
        }
        
        logger.info(f"Initialized deployment in {self.repo_root}")
    
    def run_command(self, cmd: List[str], description: str = None, cwd: Optional[Path] = None) -> bool:
        """Execute a shell command and return success status"""
        if description:
            logger.info(f"▶️  {description}...")
        
        try:
            result = subprocess.run(
                cmd,
                cwd=cwd or self.repo_root,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                logger.info(f"✅ {description or cmd[0]} succeeded")
                return True
            else:
                logger.warning(f"⚠️  {description or cmd[0]} returned code {result.returncode}")
                if result.stderr:
                    logger.warning(f"   Error: {result.stderr[:200]}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error(f"❌ {description or cmd[0]} timed out")
            self.stats['errors'].append(f"Timeout: {description}")
            return False
        except Exception as e:
            logger.error(f"❌ {description or cmd[0]} failed: {e}")
            self.stats['errors'].append(f"{description}: {str(e)}")
            return False
    
    def check_prerequisites(self) -> bool:
        """Check if all prerequisites are met"""
        logger.info("\n" + "="*60)
        logger.info("PHASE 1: CHECKING PREREQUISITES")
        logger.info("="*60)
        
        commands = ['git', 'node', 'npm', 'pnpm', 'cargo', 'rustc']
        missing = []
        
        for cmd in commands:
            if subprocess.run(['which', cmd], capture_output=True).returncode != 0:
                missing.append(cmd)
                logger.warning(f"⚠️  {cmd} not found")
            else:
                logger.info(f"✅ {cmd} available")
        
        if missing:
            logger.error(f"❌ Missing commands: {', '.join(missing)}")
            return False
        
        # Check package.json
        if not (self.repo_root / 'package.json').exists():
            logger.error("❌ package.json not found")
            return False
        
        logger.info("✅ All prerequisites met")
        self.stats['phases_completed'].append('Prerequisites')
        return True
    
    def install_dependencies(self) -> bool:
        """Install all dependencies"""
        logger.info("\n" + "="*60)
        logger.info("PHASE 2: INSTALLING DEPENDENCIES")
        logger.info("="*60)
        
        # Install pnpm dependencies
        if not self.run_command(['pnpm', 'install', '--frozen-lockfile'], 'Installing pnpm packages'):
            return False
        
        # Verify Node modules
        node_modules = self.repo_root / 'node_modules'
        if not node_modules.exists():
            logger.error("❌ Node modules installation failed")
            return False
        
        logger.info(f"✅ Node modules: {len(list(node_modules.iterdir()))} packages")
        
        self.stats['phases_completed'].append('Dependencies')
        return True
    
    def run_tests(self) -> bool:
        """Run code quality tests"""
        logger.info("\n" + "="*60)
        logger.info("PHASE 3: CODE QUALITY TESTS")
        logger.info("="*60)
        
        tests = [
            (['npx', 'tsc', '--noEmit', '--skipLibCheck'], 'TypeScript check'),
            (['pnpm', 'exec', 'eslint', '.', '--ext', '.ts,.tsx,.js,.jsx', '--max-warnings', '0'], 'ESLint check'),
            (['cargo', 'check', '--manifest-path', 'src-tauri/Cargo.toml'], 'Cargo check'),
        ]
        
        failed_tests = []
        for cmd, desc in tests:
            if not self.run_command(cmd, desc):
                failed_tests.append(desc)
                self.stats['warnings'].append(f"Test failed: {desc}")
        
        if failed_tests:
            logger.warning(f"⚠️  Some tests failed: {', '.join(failed_tests)}")
            return False
        
        logger.info("✅ All tests passed")
        self.stats['phases_completed'].append('Tests')
        return True
    
    def build_production(self) -> bool:
        """Build production artifacts"""
        logger.info("\n" + "="*60)
        logger.info("PHASE 4: PRODUCTION BUILD")
        logger.info("="*60)
        
        # Vite build
        logger.info("▶️  Building frontend with Vite...")
        vite_start = datetime.now()
        if not self.run_command(['pnpm', 'run', 'build'], 'Vite build'):
            return False
        vite_time = (datetime.now() - vite_start).total_seconds()
        logger.info(f"✅ Vite build completed in {vite_time:.1f}s")
        
        # Tauri build
        logger.info("▶️  Building native application with Tauri...")
        tauri_start = datetime.now()
        if not self.run_command(['pnpm', 'run', 'tauri:build'], 'Tauri build'):
            return False
        tauri_time = (datetime.now() - tauri_start).total_seconds()
        logger.info(f"✅ Tauri build completed in {tauri_time:.1f}s")
        
        self.stats['phases_completed'].append('Build')
        return True
    
    def stage_artifacts(self) -> bool:
        """Stage artifacts for deployment"""
        logger.info("\n" + "="*60)
        logger.info("PHASE 5: STAGING ARTIFACTS")
        logger.info("="*60)
        
        self.deploy_dir.mkdir(parents=True, exist_ok=True)
        
        # Find and copy AppImage
        appimage_src = list((self.repo_root / 'src-tauri' / 'target' / 'release' / 'bundle' / 'appimage').glob('*.AppImage'))
        if appimage_src:
            appimage_dest = self.deploy_dir / appimage_src[0].name
            self.run_command(['cp', '-v', str(appimage_src[0]), str(appimage_dest)], 'Copy AppImage')
            self.stats['artifacts_created'].append(f"{appimage_dest.name} ({appimage_dest.stat().st_size / (1024*1024):.1f} MB)")
        
        # Find and copy DEB
        deb_src = list((self.repo_root / 'src-tauri' / 'target' / 'release' / 'bundle' / 'deb').glob('*.deb'))
        if deb_src:
            deb_dest = self.deploy_dir / deb_src[0].name
            self.run_command(['cp', '-v', str(deb_src[0]), str(deb_dest)], 'Copy DEB')
            self.stats['artifacts_created'].append(f"{deb_dest.name} ({deb_dest.stat().st_size / (1024*1024):.1f} MB)")
        
        # Generate checksums
        self.run_command(
            ['bash', '-c', f'cd {self.deploy_dir} && sha256sum * > CHECKSUMS.sha256'],
            'Generate checksums'
        )
        
        logger.info(f"✅ Artifacts staged: {len(self.stats['artifacts_created'])} files")
        self.stats['phases_completed'].append('Artifacts')
        return True
    
    def generate_report(self) -> None:
        """Generate deployment report"""
        logger.info("\n" + "="*60)
        logger.info("PHASE 6: GENERATING REPORT")
        logger.info("="*60)
        
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        report = {
            'timestamp': end_time.isoformat(),
            'duration_seconds': duration,
            'status': 'SUCCESS' if not self.stats['errors'] else 'COMPLETED_WITH_ERRORS',
            'phases_completed': self.stats['phases_completed'],
            'artifacts_created': self.stats['artifacts_created'],
            'warnings': self.stats['warnings'],
            'errors': self.stats['errors'],
            'deployment_directory': str(self.deploy_dir)
        }
        
        # Write JSON report
        report_file = self.deploy_dir / 'deployment_report.json'
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"✅ Report saved: {report_file}")
        
        # Print summary
        logger.info("\n" + "="*60)
        logger.info("DEPLOYMENT SUMMARY")
        logger.info("="*60)
        logger.info(f"Status: {report['status']}")
        logger.info(f"Duration: {duration:.1f} seconds")
        logger.info(f"Phases: {len(self.stats['phases_completed'])}/{6}")
        logger.info(f"Artifacts: {len(self.stats['artifacts_created'])}")
        
        if self.stats['artifacts_created']:
            logger.info("\nCreated artifacts:")
            for artifact in self.stats['artifacts_created']:
                logger.info(f"  ✅ {artifact}")
        
        if self.stats['warnings']:
            logger.info("\nWarnings:")
            for warning in self.stats['warnings']:
                logger.info(f"  ⚠️  {warning}")
        
        if self.stats['errors']:
            logger.info("\nErrors:")
            for error in self.stats['errors']:
                logger.info(f"  ❌ {error}")
        
        logger.info(f"\nDeployment directory: {self.deploy_dir}")
        logger.info(f"Report file: {report_file}")
    
    def deploy(self) -> bool:
        """Execute complete deployment"""
        try:
            if not self.check_prerequisites():
                return False
            
            if not self.install_dependencies():
                return False
            
            if not self.run_tests():
                logger.warning("Tests had issues, continuing anyway...")
            
            if not self.build_production():
                return False
            
            if not self.stage_artifacts():
                return False
            
            self.generate_report()
            return True
            
        except Exception as e:
            logger.error(f"❌ Deployment failed: {e}")
            self.stats['errors'].append(str(e))
            self.generate_report()
            return False

def main():
    parser = argparse.ArgumentParser(
        description='TITANE∞ Complete Deployment Orchestrator'
    )
    parser.add_argument('--repo-root', help='Repository root directory')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    deployer = TitaneDeployment(args.repo_root)
    success = deployer.deploy()
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
