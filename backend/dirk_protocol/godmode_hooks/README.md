# 🌟 GOD Mode DIRK Integration Hooks

## Overview
GOD Mode provides intelligent orchestration of DIRK variants with automatic task distribution and safety guardrails.

## Hook System

### Pre-Execution Hooks
Located in: `/Users/izverg/Documents/dirk_protocol/godmode_hooks/pre/`

- `safety_check.sh` - Validates operation safety
- `dirk_selector.sh` - Chooses optimal DIRK variant
- `resource_allocator.sh` - Manages system resources

### Post-Execution Hooks
Located in: `/Users/izverg/Documents/dirk_protocol/godmode_hooks/post/`

- `result_validator.sh` - Validates DIRK outputs
- `log_aggregator.sh` - Consolidates logs
- `notification.sh` - Sends completion notifications

### Integration Points

#### DIRK.c (Claude Code)
```bash
# Automatic invocation for implementation tasks
godmode deploy DIRK.c "Implement authentication system" /project/path
```

#### DIRK.desktop (Strategic Planning)
```bash
# Routes architectural decisions to desktop interface
godmode deploy DIRK.desktop "Design microservices architecture"
```

#### DIRK.g (Gemini Review)
```bash
# Sends to Gemini for code review
godmode deploy DIRK.g "Review security implementation"
```

## Parallel Execution Protocol

When GOD Mode detects complex tasks requiring multiple DIRKs:

1. **Task Decomposition**: Breaks down requirements into subtasks
2. **DIRK Assignment**: Assigns each subtask to appropriate variant
3. **Synchronization**: Manages dependencies between DIRKs
4. **Result Aggregation**: Combines outputs into cohesive solution

## Safety Mechanisms

### Protected Operations
- System directory modifications require double confirmation
- Git operations on protected branches trigger warnings
- Database destructive operations are blocked by default

### Audit Trail
All GOD Mode operations are logged with:
- Timestamp
- User
- DIRK variant used
- Task description
- Safety checks performed
- Result status

## Usage Examples

### Intelligent Task Distribution
```bash
godmode analyze << EOF
Create a full-stack application with:
- React frontend with TypeScript
- Node.js backend with Express
- PostgreSQL database
- JWT authentication
- Docker containerization
EOF
```

GOD Mode will:
1. Assign frontend to DIRK.c
2. Send architecture to DIRK.desktop
3. Queue security review for DIRK.g
4. Coordinate parallel execution

### Emergency Override
For critical situations requiring bypass:
```bash
GODMODE_FORCE=true godmode deploy DIRK.c "Emergency fix" --skip-safety
```
⚠️ Use with extreme caution!

## Configuration

### Custom DIRK Weights
Edit `~/.claude_configs/dirk_weights.json`:
```json
{
  "task_weights": {
    "implementation": { "DIRK.c": 0.8, "DIRK.desktop": 0.2 },
    "architecture": { "DIRK.desktop": 0.7, "DIRK.g": 0.3 },
    "review": { "DIRK.g": 0.9, "DIRK.desktop": 0.1 }
  }
}
```

### Performance Tuning
- `max_parallel_dirks`: Maximum concurrent DIRK instances
- `timeout_seconds`: Global timeout for operations
- `memory_limit_mb`: Memory allocation per DIRK

## Best Practices

1. **Always Review GOD Mode Suggestions**: While intelligent, verify DIRK assignments
2. **Use Parallel Mode for Large Projects**: Significant speed improvements
3. **Monitor Resource Usage**: Check `godmode status` regularly
4. **Backup Before Major Operations**: GOD Mode is powerful but not infallible
5. **Customize Safety Rules**: Tailor to your project needs

## Troubleshooting

### Common Issues
- **"Permission Denied"**: Run setup script: `~/.claude_configs/setup_godmode.sh`
- **"DIRK Not Found"**: Ensure all DIRK variants are properly configured
- **"Safety Check Failed"**: Review safety configuration, may need adjustment

### Debug Mode
```bash
GODMODE_DEBUG=true godmode analyze
```

## Integration with Existing Tools

### VS Code
```json
{
  "tasks": [
    {
      "label": "GOD Mode Analyze",
      "type": "shell",
      "command": "godmode analyze ${workspaceFolder}"
    }
  ]
}
```

### Git Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit
godmode deploy DIRK.g "Pre-commit code review" || exit 1
```
