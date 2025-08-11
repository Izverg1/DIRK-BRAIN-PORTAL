# Cerebro Implementation - Focused Prompt

## 🎯 **MISSION: Transform Dashboard into Cerebro**

**DASHBOARD IS COMPLETE!** ✅ You've successfully wired up all functionality.

**NEW GOAL:** Replace the current 2D dashboard with a **3D Cerebro-style visualization** showing AI agents working across projects in real-time.

## 🧠 **The Cerebro Vision**

Transform your working dashboard into **Professor X's Cerebro** - a 3D space where:
- **Projects = Floating spheres** in 3D space
- **AI Agents = Glowing orbs** moving between projects  
- **Tasks = Progress bars** floating above agents
- **Collaboration = Agent swarms** forming patterns
- **Data flow = Particle streams** between entities

## 📊 **Use Your Existing Data**

You already have working API endpoints:
```javascript
// Your working APIs:
GET /api/agents     // Agent status and workloads
GET /api/tasks      // Active/completed/failed tasks  
GET /api/projects   // Project information
GET /api/metrics    // System performance data
```

**Transform this data into 3D visualization!**

## 🚀 **Implementation Steps**

### Step 1: Create 3D Scene Component (1 hour)
```typescript
// Create: components/CerebroVisualization.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

export function CerebroVisualization() {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas camera={{ position: [0, 30, 80], fov: 60 }}>
        <Stars radius={300} depth={50} count={1000} factor={4} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Add your 3D components here */}
        <ProjectSpheres />
        <AgentEntities />
        <DataStreams />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  )
}
```

### Step 2: Project Spheres (1 hour)
```typescript
// Create floating project spheres
function ProjectSpheres() {
  const { data: projects } = useSWR('/api/projects', fetcher)
  
  return (
    <>
      {projects?.map((project, index) => (
        <ProjectSphere 
          key={project.id}
          project={project}
          position={getProjectPosition(index, projects.length)}
        />
      ))}
    </>
  )
}

function ProjectSphere({ project, position }) {
  const meshRef = useRef()
  
  // Rotate sphere based on activity
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial 
          color={getProjectColor(project.status)}
          transparent 
          opacity={0.7}
          emissive={getProjectColor(project.status)}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Project name floating above */}
      <Text
        position={[0, 8, 0]}
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {project.name}
      </Text>
      
      {/* Completion ring around sphere */}
      <CompletionRing completion={project.completion} />
    </group>
  )
}
```

### Step 3: Agent Entities (1.5 hours)
```typescript
// Create glowing agent orbs
function AgentEntities() {
  const { data: agents } = useSWR('/api/agents', fetcher)
  
  return (
    <>
      {agents?.map(agent => (
        <AgentEntity key={agent.id} agent={agent} />
      ))}
    </>
  )
}

function AgentEntity({ agent }) {
  const meshRef = useRef()
  const [targetPosition, setTargetPosition] = useState([0, 0, 0])
  
  // Smooth movement to target
  useFrame(() => {
    if (meshRef.current) {
      // Lerp to target position
      meshRef.current.position.lerp(
        new THREE.Vector3(...targetPosition), 
        0.02
      )
      
      // Pulsing based on workload
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2 * (agent.workload / 100)
      meshRef.current.scale.setScalar(scale)
    }
  })
  
  // Update target when agent changes project
  useEffect(() => {
    if (agent.currentProject) {
      const projectPos = getProjectPosition(agent.currentProject)
      setTargetPosition([
        projectPos[0] + Math.random() * 10 - 5,
        projectPos[1] + Math.random() * 5,
        projectPos[2] + Math.random() * 10 - 5
      ])
    }
  }, [agent.currentProject])
  
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={getAgentColor(agent.type)}
          emissive={getAgentColor(agent.type)}
          emissiveIntensity={agent.performance / 100}
        />
      </mesh>
      
      {/* Agent trail effect */}
      <AgentTrail agent={agent} />
      
      {/* Progress bar above agent */}
      {agent.currentTask && (
        <ProgressBar 
          position={[0, 3, 0]}
          progress={agent.taskProgress}
          task={agent.currentTask}
        />
      )}
    </group>
  )
}
```

### Step 4: Real-time Progress Indicators (1 hour)
```typescript
// Floating progress bars above agents
function ProgressBar({ position, progress, task }) {
  return (
    <group position={position}>
      {/* Background bar */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.2, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Progress fill */}
      <mesh position={[-(2 - (progress/100) * 2), 0, 0.05]}>
        <boxGeometry args={[(progress/100) * 4, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Task description */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {task.title}
      </Text>
      
      {/* Progress percentage */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.4}
        color="#00ff00"
        anchorX="center"
      >
        {Math.round(progress)}%
      </Text>
    </group>
  )
}
```

### Step 5: Data Flow Streams (1.5 hours)
```typescript
// Particle streams between agents and projects
function DataStreams() {
  const { data: tasks } = useSWR('/api/tasks', fetcher)
  
  return (
    <>
      {tasks?.filter(task => task.status === 'active').map(task => (
        <DataStream
          key={task.id}
          from={getAgentPosition(task.agentId)}
          to={getProjectPosition(task.projectId)}
          type={task.type}
        />
      ))}
    </>
  )
}

function DataStream({ from, to, type }) {
  const points = useMemo(() => {
    // Create curved path between points
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      new THREE.Vector3(
        (from[0] + to[0]) / 2,
        Math.max(from[1], to[1]) + 10,
        (from[2] + to[2]) / 2
      ),
      new THREE.Vector3(...to)
    ])
    return curve.getPoints(50)
  }, [from, to])
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={getStreamColor(type)} />
    </line>
  )
}
```

### Step 6: Agent Swarms & Collaboration (1 hour)
```typescript
// Show agents collaborating in formations
function AgentSwarms() {
  const { data: tasks } = useSWR('/api/tasks', fetcher)
  
  // Find tasks with multiple agents
  const collaborativeTasks = tasks?.filter(task => 
    task.assignedAgents && task.assignedAgents.length > 1
  )
  
  return (
    <>
      {collaborativeTasks?.map(task => (
        <AgentSwarm key={task.id} task={task} />
      ))}
    </>
  )
}

function AgentSwarm({ task }) {
  const agents = task.assignedAgents
  const centerPos = getProjectPosition(task.projectId)
  
  return (
    <group>
      {/* Connection lines between agents */}
      {agents.map((agent, i) => 
        agents.slice(i + 1).map((otherAgent, j) => (
          <ConnectionLine
            key={`${agent.id}-${otherAgent.id}`}
            from={getAgentPosition(agent.id)}
            to={getAgentPosition(otherAgent.id)}
          />
        ))
      )}
      
      {/* Central collaboration indicator */}
      <mesh position={centerPos}>
        <ringGeometry args={[8, 10, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
```

## 🎨 **Visual Design Guidelines**

### Colors:
- **DIRK.c agents:** Blue (#0066ff)
- **DIRK.g agents:** Green (#00ff66)  
- **DIRK.desktop agents:** Purple (#6600ff)
- **Projects:** Health-based (Green/Yellow/Red)
- **Data streams:** Type-based (Blue/Green/Yellow/Red)

### Effects:
- **Glowing materials** with emissive properties
- **Smooth animations** using useFrame and lerp
- **Particle trails** behind moving agents
- **Pulsing effects** based on activity/performance
- **Transparent materials** for depth and layering

## 🔧 **Integration with Your Dashboard**

Replace your current dashboard component:
```typescript
// In your main dashboard file:
import { CerebroVisualization } from './components/CerebroVisualization'

export function Dashboard() {
  return (
    <div className="h-screen">
      {/* Keep your existing UI controls */}
      <DashboardControls />
      
      {/* Replace charts with Cerebro */}
      <CerebroVisualization />
      
      {/* Keep notification system */}
      <NotificationSystem />
    </div>
  )
}
```

## ✅ **Success Criteria**

When complete, users should see:
- [ ] **Projects as floating spheres** in 3D space
- [ ] **AI agents as glowing orbs** moving between projects
- [ ] **Real-time progress bars** above working agents
- [ ] **Particle streams** showing data flow
- [ ] **Agent swarms** for collaborative tasks
- [ ] **Smooth animations** and professional effects
- [ ] **Interactive controls** (orbit, zoom, select)

## 🚀 **Timeline: 6-7 hours total**

This transforms your functional dashboard into the **most impressive AI orchestration interface ever built** - like commanding a fleet of AI agents from a futuristic command center!

**Start with Step 1 and build incrementally. Each step adds more "wow factor" to the visualization.**