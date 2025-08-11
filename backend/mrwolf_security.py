"""
MrWolf Security Validator - "The Wolf" from Pulp Fiction
Comprehensive security validation and threat detection
"I solve problems" - Winston Wolf
"""

import re
import os
import json
import hashlib
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import subprocess
import ast

logger = logging.getLogger(__name__)

class MrWolfAdvisor:
    """
    The Wolf - Direct, professional problem solver
    Handles security validation, code review, and compliance
    """
    
    def __init__(self):
        self.name = "Winston Wolf"
        self.initialize_threat_database()
        self.code_smell_patterns = self.load_code_smell_patterns()
        self.vulnerability_database = self.load_vulnerability_database()
        self.compliance_rules = self.load_compliance_rules()
        
    def initialize_threat_database(self):
        """Initialize comprehensive threat detection patterns"""
        self.threat_patterns = {
            # SQL Injection patterns
            "sql_injection": [
                re.compile(r'(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|CREATE|ALTER).*?(FROM|INTO|WHERE)', re.IGNORECASE),
                re.compile(r'(exec|execute|sp_executesql)\s*\(', re.IGNORECASE),
                re.compile(r'(\' OR \'|\' OR 1=1|" OR "|" OR 1=1)', re.IGNORECASE),
                re.compile(r'(--|\#|\/\*.*\*\/)', re.IGNORECASE),  # SQL comments
            ],
            
            # XSS patterns
            "xss": [
                re.compile(r'<script[^>]*>.*?</script>', re.IGNORECASE | re.DOTALL),
                re.compile(r'javascript:', re.IGNORECASE),
                re.compile(r'on\w+\s*=\s*["\']', re.IGNORECASE),  # Event handlers
                re.compile(r'<iframe[^>]*>', re.IGNORECASE),
                re.compile(r'document\.(write|writeln|cookie|location)', re.IGNORECASE),
                re.compile(r'eval\s*\(', re.IGNORECASE),
            ],
            
            # Command Injection
            "command_injection": [
                re.compile(r'(system|exec|shell_exec|passthru|popen|proc_open)\s*\('),
                re.compile(r'(\||;|&|`|\$\(|\$\{)', re.IGNORECASE),  # Shell metacharacters
                re.compile(r'(subprocess\.(call|run|Popen)|os\.(system|popen|exec))', re.IGNORECASE),
            ],
            
            # Path Traversal
            "path_traversal": [
                re.compile(r'\.\.\/|\.\.\\'),  # Directory traversal
                re.compile(r'(\/etc\/passwd|\/etc\/shadow|C:\\Windows\\System32)'),
            ],
            
            # XXE (XML External Entity)
            "xxe": [
                re.compile(r'<!DOCTYPE[^>]*\[<!ENTITY', re.IGNORECASE),
                re.compile(r'SYSTEM\s+"file:///', re.IGNORECASE),
            ],
            
            # LDAP Injection
            "ldap_injection": [
                re.compile(r'\*\s*\|\s*\(|\)\s*\|\s*\('),
                re.compile(r'(objectClass=\*|uid=\*)', re.IGNORECASE),
            ],
            
            # Sensitive Data Exposure
            "sensitive_data": [
                re.compile(r'(password|passwd|pwd|secret|token|apikey|api_key|private_key)\s*=\s*["\'][^"\']+["\']', re.IGNORECASE),
                re.compile(r'[A-Za-z0-9+/]{40,}={0,2}'),  # Base64 encoded strings
                re.compile(r'-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----'),
                re.compile(r'sk_live_[A-Za-z0-9]+'),  # Stripe keys
                re.compile(r'AKIA[0-9A-Z]{16}'),  # AWS Access Key
            ],
            
            # Insecure Deserialization
            "insecure_deserialization": [
                re.compile(r'(pickle\.loads?|yaml\.load\s*\(|json\.loads?\s*\(.*unsafe)', re.IGNORECASE),
                re.compile(r'(unserialize|deserialize)\s*\(', re.IGNORECASE),
            ]
        }
        
    def load_code_smell_patterns(self) -> Dict[str, List[re.Pattern]]:
        """Load patterns for detecting code smells"""
        return {
            "hardcoded_credentials": [
                re.compile(r'(password|secret|key)\s*=\s*["\'][^"\']+["\']', re.IGNORECASE),
            ],
            "weak_crypto": [
                re.compile(r'(MD5|SHA1|DES|RC4)', re.IGNORECASE),
            ],
            "unsafe_random": [
                re.compile(r'random\.random\(\)|Math\.random\(\)'),
            ],
            "no_input_validation": [
                re.compile(r'request\.(GET|POST|params|query)\[.+\](?!\.)'),
            ],
            "debug_code": [
                re.compile(r'(console\.log|print|debugger|pdb\.set_trace)'),
            ],
            "todo_fixme": [
                re.compile(r'(TODO|FIXME|HACK|XXX|BUG):', re.IGNORECASE),
            ]
        }
        
    def load_vulnerability_database(self) -> Dict[str, Any]:
        """Load known vulnerability patterns"""
        return {
            "dependency_vulnerabilities": {
                "npm": {
                    "lodash": {"<4.17.21": "Prototype Pollution"},
                    "minimist": {"<1.2.6": "Prototype Pollution"},
                    "axios": {"<0.21.2": "SSRF"},
                },
                "python": {
                    "django": {"<3.2": "SQL Injection in QuerySet.order_by()"},
                    "flask": {"<2.0.2": "Debug mode enabled in production"},
                    "requests": {"<2.20.0": "Information disclosure"},
                }
            },
            "configuration_issues": [
                "DEBUG mode enabled",
                "Default credentials",
                "Permissive CORS policy",
                "Missing security headers",
                "Weak TLS configuration"
            ]
        }
        
    def load_compliance_rules(self) -> Dict[str, List[str]]:
        """Load compliance validation rules"""
        return {
            "OWASP": [
                "Validate all inputs",
                "Use parameterized queries",
                "Implement proper authentication",
                "Use secure session management",
                "Encrypt sensitive data",
                "Implement access controls",
                "Log security events",
                "Use HTTPS everywhere",
                "Keep dependencies updated",
                "Perform security testing"
            ],
            "PCI_DSS": [
                "Don't store card numbers unencrypted",
                "Use strong cryptography",
                "Restrict access to cardholder data",
                "Regularly test security systems",
                "Maintain security policies"
            ],
            "GDPR": [
                "Obtain user consent",
                "Allow data portability",
                "Implement right to erasure",
                "Encrypt personal data",
                "Report breaches within 72 hours"
            ]
        }
    
    def validate_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Comprehensive code validation
        The Wolf doesn't miss anything
        """
        logger.info(f"MrWolf: Starting code validation for {language}")
        
        results = {
            "status": "clean",
            "threats": [],
            "vulnerabilities": [],
            "code_smells": [],
            "recommendations": [],
            "risk_score": 0,
            "summary": ""
        }
        
        # Check for threats
        for threat_type, patterns in self.threat_patterns.items():
            for pattern in patterns:
                if pattern.search(code):
                    results["threats"].append({
                        "type": threat_type,
                        "severity": "HIGH",
                        "description": f"Potential {threat_type.replace('_', ' ')} detected",
                        "line": self._find_line_number(code, pattern)
                    })
                    results["risk_score"] += 30
        
        # Check for code smells
        for smell_type, patterns in self.code_smell_patterns.items():
            for pattern in patterns:
                if pattern.search(code):
                    results["code_smells"].append({
                        "type": smell_type,
                        "severity": "MEDIUM",
                        "description": f"Code smell: {smell_type.replace('_', ' ')}",
                        "line": self._find_line_number(code, pattern)
                    })
                    results["risk_score"] += 10
        
        # Language-specific validation
        if language == "python":
            results["vulnerabilities"].extend(self._validate_python_code(code))
        elif language == "javascript":
            results["vulnerabilities"].extend(self._validate_javascript_code(code))
        
        # Generate recommendations
        results["recommendations"] = self._generate_recommendations(results)
        
        # Determine overall status
        if results["risk_score"] >= 70:
            results["status"] = "critical"
            results["summary"] = "The Wolf says: 'We got a problem here. Major security issues detected.'"
        elif results["risk_score"] >= 40:
            results["status"] = "warning"
            results["summary"] = "The Wolf says: 'Needs work. Several issues to address.'"
        elif results["risk_score"] >= 20:
            results["status"] = "caution"
            results["summary"] = "The Wolf says: 'Pretty good, but could be better.'"
        else:
            results["status"] = "clean"
            results["summary"] = "The Wolf says: 'Clean. Professional work.'"
        
        return results
    
    def _validate_python_code(self, code: str) -> List[Dict[str, Any]]:
        """Python-specific validation"""
        vulnerabilities = []
        
        try:
            # Parse Python AST
            tree = ast.parse(code)
            
            # Check for dangerous functions
            for node in ast.walk(tree):
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name):
                        func_name = node.func.id
                        
                        # Check for dangerous functions
                        dangerous_funcs = {
                            "eval": "Never use eval() - extremely dangerous",
                            "exec": "Avoid exec() - security risk",
                            "__import__": "Dynamic imports can be dangerous",
                            "compile": "Compilation of user input is risky"
                        }
                        
                        if func_name in dangerous_funcs:
                            vulnerabilities.append({
                                "type": "dangerous_function",
                                "severity": "HIGH",
                                "description": dangerous_funcs[func_name],
                                "function": func_name,
                                "line": node.lineno
                            })
                
                # Check for assert statements (removed in optimized code)
                if isinstance(node, ast.Assert):
                    vulnerabilities.append({
                        "type": "assert_usage",
                        "severity": "LOW",
                        "description": "Assert statements are removed in optimized code",
                        "line": node.lineno
                    })
        
        except SyntaxError as e:
            vulnerabilities.append({
                "type": "syntax_error",
                "severity": "HIGH",
                "description": f"Syntax error: {str(e)}",
                "line": e.lineno if hasattr(e, 'lineno') else 0
            })
        
        return vulnerabilities
    
    def _validate_javascript_code(self, code: str) -> List[Dict[str, Any]]:
        """JavaScript-specific validation"""
        vulnerabilities = []
        
        # Check for dangerous patterns
        dangerous_patterns = {
            r'eval\s*\(': "eval() is dangerous - avoid at all costs",
            r'innerHTML\s*=': "innerHTML can lead to XSS - use textContent",
            r'document\.write': "document.write is dangerous",
            r'Function\s*\(': "Function constructor is like eval",
            r'setTimeout\s*\(["\']': "setTimeout with string is dangerous"
        }
        
        for pattern, description in dangerous_patterns.items():
            if re.search(pattern, code, re.IGNORECASE):
                vulnerabilities.append({
                    "type": "dangerous_pattern",
                    "severity": "HIGH",
                    "description": description,
                    "pattern": pattern
                })
        
        return vulnerabilities
    
    def _find_line_number(self, code: str, pattern: re.Pattern) -> int:
        """Find the line number where pattern matches"""
        lines = code.split('\n')
        for i, line in enumerate(lines, 1):
            if pattern.search(line):
                return i
        return 0
    
    def _generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """Generate Wolf-style recommendations"""
        recommendations = []
        
        if results["threats"]:
            recommendations.append("Fix all security threats immediately - this is non-negotiable")
        
        if any(t["type"] == "sql_injection" for t in results["threats"]):
            recommendations.append("Use parameterized queries - no exceptions")
        
        if any(t["type"] == "xss" for t in results["threats"]):
            recommendations.append("Sanitize all user inputs and use Content Security Policy")
        
        if any(s["type"] == "hardcoded_credentials" for s in results["code_smells"]):
            recommendations.append("Move credentials to environment variables - now")
        
        if any(s["type"] == "weak_crypto" for s in results["code_smells"]):
            recommendations.append("Update to modern cryptography (AES-256, SHA-256 minimum)")
        
        if not recommendations:
            recommendations.append("Keep up the good work, but stay vigilant")
        
        return recommendations
    
    def validate_dependencies(self, package_file: str, file_type: str = "package.json") -> Dict[str, Any]:
        """Validate project dependencies for vulnerabilities"""
        results = {
            "vulnerable_packages": [],
            "outdated_packages": [],
            "risk_level": "low",
            "recommendations": []
        }
        
        try:
            with open(package_file, 'r') as f:
                if file_type == "package.json":
                    data = json.load(f)
                    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                    
                    # Check against known vulnerabilities
                    npm_vulns = self.vulnerability_database["dependency_vulnerabilities"]["npm"]
                    
                    for package, version in deps.items():
                        if package in npm_vulns:
                            # Simple version check (in production, use proper semver)
                            results["vulnerable_packages"].append({
                                "package": package,
                                "current": version,
                                "vulnerability": npm_vulns[package],
                                "severity": "HIGH"
                            })
                    
                elif file_type == "requirements.txt":
                    # Parse requirements.txt
                    with open(package_file, 'r') as f:
                        lines = f.readlines()
                    
                    python_vulns = self.vulnerability_database["dependency_vulnerabilities"]["python"]
                    
                    for line in lines:
                        if '==' in line:
                            package, version = line.strip().split('==')
                            if package in python_vulns:
                                results["vulnerable_packages"].append({
                                    "package": package,
                                    "current": version,
                                    "vulnerability": python_vulns[package],
                                    "severity": "HIGH"
                                })
        
        except Exception as e:
            logger.error(f"Error checking dependencies: {e}")
        
        # Determine risk level
        if len(results["vulnerable_packages"]) > 5:
            results["risk_level"] = "critical"
            results["recommendations"].append("The Wolf says: 'Update your dependencies NOW - you're exposed'")
        elif len(results["vulnerable_packages"]) > 2:
            results["risk_level"] = "high"
            results["recommendations"].append("The Wolf says: 'Several vulnerable packages - fix this today'")
        elif results["vulnerable_packages"]:
            results["risk_level"] = "medium"
            results["recommendations"].append("The Wolf says: 'Some vulnerabilities found - address them soon'")
        else:
            results["recommendations"].append("The Wolf says: 'Dependencies look clean - good job'")
        
        return results
    
    def check_compliance(self, project_path: str, standards: List[str] = ["OWASP"]) -> Dict[str, Any]:
        """Check project compliance with security standards"""
        results = {
            "compliant": True,
            "violations": [],
            "warnings": [],
            "score": 100
        }
        
        for standard in standards:
            if standard in self.compliance_rules:
                rules = self.compliance_rules[standard]
                
                for rule in rules:
                    # Simple compliance checks (in production, these would be more sophisticated)
                    if "HTTPS" in rule:
                        # Check for HTTPS usage
                        if not self._check_https_usage(project_path):
                            results["violations"].append({
                                "standard": standard,
                                "rule": rule,
                                "severity": "HIGH"
                            })
                            results["score"] -= 10
                    
                    elif "encrypt" in rule.lower():
                        # Check for encryption
                        if not self._check_encryption_usage(project_path):
                            results["warnings"].append({
                                "standard": standard,
                                "rule": rule,
                                "severity": "MEDIUM"
                            })
                            results["score"] -= 5
        
        results["compliant"] = results["score"] >= 70
        
        if not results["compliant"]:
            results["summary"] = "The Wolf says: 'Not compliant. Fix these issues before deployment.'"
        else:
            results["summary"] = "The Wolf says: 'Compliance looks good. Stay sharp.'"
        
        return results
    
    def _check_https_usage(self, project_path: str) -> bool:
        """Check if project uses HTTPS"""
        # Simplified check - in production would be more thorough
        patterns = [
            re.compile(r'https://', re.IGNORECASE),
            re.compile(r'useSSL.*true', re.IGNORECASE)
        ]
        
        # Check main configuration files
        config_files = ["config.json", "settings.py", ".env", "application.properties"]
        
        for config_file in config_files:
            file_path = os.path.join(project_path, config_file)
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    content = f.read()
                    for pattern in patterns:
                        if pattern.search(content):
                            return True
        
        return False
    
    def _check_encryption_usage(self, project_path: str) -> bool:
        """Check if project uses encryption"""
        # Look for encryption libraries
        encryption_indicators = [
            "crypto", "cryptography", "bcrypt", "argon2",
            "AES", "RSA", "encrypt", "decrypt"
        ]
        
        # Check package files
        package_files = ["package.json", "requirements.txt", "Gemfile", "pom.xml"]
        
        for package_file in package_files:
            file_path = os.path.join(project_path, package_file)
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    content = f.read().lower()
                    for indicator in encryption_indicators:
                        if indicator.lower() in content:
                            return True
        
        return False
    
    def generate_security_report(self, project_path: str) -> Dict[str, Any]:
        """Generate comprehensive security report - The Wolf's final verdict"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "project": project_path,
            "inspector": "Winston Wolf",
            "sections": {}
        }
        
        # Code validation
        code_files = []
        for root, dirs, files in os.walk(project_path):
            for file in files:
                if file.endswith(('.py', '.js', '.ts', '.java', '.go')):
                    code_files.append(os.path.join(root, file))
        
        if code_files:
            # Sample first few files (in production, check all)
            sample_file = code_files[0]
            with open(sample_file, 'r') as f:
                code = f.read()
            
            language = "python" if sample_file.endswith('.py') else "javascript"
            report["sections"]["code_validation"] = self.validate_code(code, language)
        
        # Dependency check
        if os.path.exists(os.path.join(project_path, "package.json")):
            report["sections"]["dependencies"] = self.validate_dependencies(
                os.path.join(project_path, "package.json"),
                "package.json"
            )
        
        # Compliance check
        report["sections"]["compliance"] = self.check_compliance(project_path)
        
        # Overall assessment
        total_risk = sum([
            report["sections"].get("code_validation", {}).get("risk_score", 0),
            len(report["sections"].get("dependencies", {}).get("vulnerable_packages", [])) * 20,
            100 - report["sections"].get("compliance", {}).get("score", 100)
        ])
        
        if total_risk > 100:
            report["verdict"] = "CRITICAL - Immediate action required"
            report["wolf_says"] = "We got a situation here. Drop everything and fix these issues."
        elif total_risk > 50:
            report["verdict"] = "WARNING - Significant issues found"
            report["wolf_says"] = "This needs work. I solve problems, but you need to do your part."
        elif total_risk > 20:
            report["verdict"] = "CAUTION - Minor issues found"
            report["wolf_says"] = "Pretty good, but I see some issues. Clean them up."
        else:
            report["verdict"] = "CLEAN - Good to go"
            report["wolf_says"] = "Professional work. You're good to go."
        
        return report

# Global MrWolf instance
mr_wolf = MrWolfAdvisor()