'use client'

import React, { useEffect, useRef } from 'react'

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null
  className?: string
  color?: string
  lineWidth?: number
  type?: 'waveform' | 'frequency'
}

export function WaveformVisualizer({
  analyser,
  className,
  color = '#f59e0b',
  lineWidth = 1.5,
  type = 'waveform',
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!analyser) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    let animationId: number

    const draw = () => {
      animationId = requestAnimationFrame(draw)

      // Handle resize internally if canvas dimensions change
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      if (
        canvas.width !== rect.width * dpr ||
        canvas.height !== rect.height * dpr
      ) {
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)
      }

      const width = rect.width
      const height = rect.height

      ctx.clearRect(0, 0, width, height)

      if (type === 'waveform') {
        analyser.getByteTimeDomainData(dataArray)

        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.beginPath()

        const sliceWidth = width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0
          const y = (v * height) / 2

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          x += sliceWidth
        }

        ctx.lineTo(width, height / 2)
        ctx.stroke()
      } else {
        analyser.getByteFrequencyData(dataArray)

        ctx.fillStyle = color
        const barWidth = (width / bufferLength) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * height

          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)
          x += barWidth
        }
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [analyser, color, lineWidth, type])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
