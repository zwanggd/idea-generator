import { useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { MoveDirection, OutMode, type Container, type ISourceOptions } from '@tsparticles/engine'

const ParticlesBackground = () => {
  const [init, setInit] = useState(false)
  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container)
  }

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const options: ISourceOptions = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 100 },
      color: { value: '#ffffff' },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 0.3,
          sync: false,
        },
      },
      opacity: {
        value: 0.08,
        animation: {
          enable: true,
          speed: 0.3,
          minimumValue: 0.05,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 0.3,
        direction: MoveDirection.none,
        outModes: { default: OutMode.bounce },
      },
    },
    detectRetina: true,
  }), [])

  if (!init) return null

  return (
    <Particles
      id="tsparticles"
      className="fixed inset-0 z-[1] pointer-events-none"
      options={options}
      particlesLoaded={particlesLoaded}
    />
  )
}

export default ParticlesBackground
