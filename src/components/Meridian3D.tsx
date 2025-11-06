import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useDataStore } from '../stores/dataStore'

interface Meridian3DProps {
  meridianId: string
}

export function Meridian3D({ meridianId }: Meridian3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const { meridians } = useDataStore()
  const [loading, setLoading] = useState(true)
  
  const meridian = meridians.find(m => m.id === meridianId)

  useEffect(() => {
    if (!mountRef.current || !meridian) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(800, 600)
    renderer.setClearColor(0xf8fafc, 0)
    mountRef.current.appendChild(renderer.domElement)

    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)

    // 创建人体轮廓（简化的人体模型）
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 1.2, 4, 8)
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xe2e8f0, 
      transparent: true, 
      opacity: 0.3 
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    scene.add(body)

    // 创建经络线路
    const points = []
    // 简化的经络路径点
    if (meridian.type === 'regular') {
      // 手臂经络
      if (meridian.name.includes('手')) {
        for (let i = 0; i < 20; i++) {
          const x = (i % 2 === 0 ? -1 : 1) * (1 + Math.sin(i * 0.3) * 0.3)
          const y = 1.5 - i * 0.15
          const z = Math.cos(i * 0.2) * 0.2
          points.push(new THREE.Vector3(x, y, z))
        }
      } else {
        // 腿部经络
        for (let i = 0; i < 25; i++) {
          const x = Math.sin(i * 0.2) * 0.5
          const y = -1.5 + i * 0.12
          const z = Math.cos(i * 0.15) * 0.3
          points.push(new THREE.Vector3(x, y, z))
        }
      }
    }

    if (points.length > 0) {
      const curve = new THREE.CatmullRomCurve3(points)
      const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.02, 8, false)
      
      // 根据经络类型设置颜色
      let color = 0xff6b6b // 默认红色
      if (meridian.type === 'regular') {
        if (meridian.name.includes('肺') || meridian.name.includes('大肠')) color = 0xff6b6b
        else if (meridian.name.includes('胃') || meridian.name.includes('脾')) color = 0x4ecdc4
        else if (meridian.name.includes('心') || meridian.name.includes('小肠')) color = 0x45b7d1
        else if (meridian.name.includes('膀胱') || meridian.name.includes('肾')) color = 0x96ceb4
        else if (meridian.name.includes('心包') || meridian.name.includes('三焦')) color = 0xfeca57
        else if (meridian.name.includes('胆') || meridian.name.includes('肝')) color = 0xff9ff3
      } else {
        color = 0x9c88ff // 奇经八脉用紫色
      }
      
      const tubeMaterial = new THREE.MeshLambertMaterial({ color })
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
      scene.add(tube)
    }

    // 创建经络路径点
    const acupointPoints = []
    if (meridian.type === 'regular') {
      // 手臂经络
      if (meridian.name.includes('手')) {
        for (let i = 0; i < 10; i++) {
          acupointPoints.push({ x: 0.5 + Math.random() * 0.3, y: 0.3 + i * 0.1, z: 0.2 + Math.random() * 0.1 })
        }
      } else {
        // 腿部经络
        for (let i = 0; i < 10; i++) {
          acupointPoints.push({ x: 0.5 + Math.random() * 0.3, y: -0.5 - i * 0.1, z: 0.2 + Math.random() * 0.1 })
        }
      }
    } else {
      // 奇经八脉 - 躯干部分
      for (let i = 0; i < 8; i++) {
        acupointPoints.push({ x: 0.5 + Math.random() * 0.2, y: 0.2 + i * 0.05, z: 0.3 + Math.random() * 0.1 })
      }
    }

    // 添加穴位点
    const acupointGeometry = new THREE.SphereGeometry(0.05, 8, 8)
    const acupointMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 })
    
    // 为经络添加一些穴位点
    const acupointCount = 8
    for (let i = 0; i < acupointCount; i++) {
      const sphere = new THREE.Mesh(acupointGeometry, acupointMaterial)
      if (acupointPoints.length > 0) {
        const pointIndex = Math.floor((i / acupointCount) * acupointPoints.length)
        const p = acupointPoints[pointIndex]
        sphere.position.set(p.x, p.y, p.z)
      } else {
        sphere.position.set(0, 0, 0)
      }
      scene.add(sphere)
    }

    camera.position.set(3, 2, 5)
    camera.lookAt(0, 0, 0)

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    animate()
    setLoading(false)

    // 清理函数
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [meridian])

  if (!meridian) {
    return <div className="text-center py-8">经络数据不存在</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {meridian.name} - 3D可视化
      </h3>
      
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">加载3D模型中...</div>
        </div>
      )}
      
      <div 
        ref={mountRef} 
        className="w-full flex justify-center"
        style={{ minHeight: '600px' }}
      />
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• 鼠标拖拽旋转视角</p>
        <p>• 滚轮缩放</p>
        <p>• 红色球体表示穴位位置</p>
        <p>• 彩色线条表示经络走向</p>
      </div>
    </div>
  )
}