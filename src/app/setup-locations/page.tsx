'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react'
import { toast, Toaster } from 'sonner'

interface SetupStep {
  id: string
  name: string
  description: string
  completed: boolean
}

export default function SetupLocationsPage() {
  const [isSetupRunning, setIsSetupRunning] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'check-tables',
      name: 'Check Database Tables',
      description: 'Verify that the locations table and columns exist',
      completed: false
    },
    {
      id: 'create-presets',
      name: 'Create Preset Locations',
      description: 'Set up the 10 curated location presets for your library',
      completed: false
    },
    {
      id: 'migrate-legacy',
      name: 'Migrate Legacy Locations',
      description: 'Convert existing book locations to hierarchical system',
      completed: false
    }
  ])

  const runSetup = async () => {
    setIsSetupRunning(true)
    setSetupError(null)

    try {
      // Step 1: Check setup status
      setSteps(prev => prev.map(step => 
        step.id === 'check-tables' ? { ...step, completed: false } : step
      ))

      const checkResponse = await fetch('/api/setup-locations', {
        method: 'GET'
      })

      if (!checkResponse.ok) {
        throw new Error('Failed to check setup status')
      }

      const checkData = await checkResponse.json()
      console.log('Setup check:', checkData)

      setSteps(prev => prev.map(step => 
        step.id === 'check-tables' ? { ...step, completed: true } : step
      ))

      // Step 2: Run the actual setup
      setSteps(prev => prev.map(step => 
        step.id === 'create-presets' ? { ...step, completed: false } : step
      ))

      const setupResponse = await fetch('/api/setup-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!setupResponse.ok) {
        const errorData = await setupResponse.json()
        throw new Error(errorData.message || errorData.error || 'Setup failed')
      }

      const setupData = await setupResponse.json()
      console.log('Setup result:', setupData)

      setSteps(prev => prev.map(step => {
        if (step.id === 'create-presets' || step.id === 'migrate-legacy') {
          return { ...step, completed: true }
        }
        return step
      }))

      setSetupComplete(true)
      toast.success('Location system setup completed successfully!')

    } catch (error) {
      console.error('Setup error:', error)
      setSetupError(error instanceof Error ? error.message : 'Unknown error occurred')
      toast.error('Setup failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSetupRunning(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Toaster position="bottom-right" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📍 Location System Setup
          </CardTitle>
          <CardDescription>
            Initialize the hierarchical location system for your book collection.
            This will create preset locations and migrate your existing books.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Setup Steps */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : isSetupRunning ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {setupError && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">Setup Error</div>
                <div className="text-sm text-red-700">{setupError}</div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {setupComplete && (
            <div className="p-4 rounded-lg border border-green-200 bg-green-50">
              <div className="font-medium text-green-800">🎉 Setup Complete!</div>
              <div className="text-sm text-green-700 mt-1">
                Your location system is now ready. You can start adding books with hierarchical locations!
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={runSetup} 
              disabled={isSetupRunning || setupComplete}
              className="flex-1"
            >
              {isSetupRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Setting up...
                </>
              ) : setupComplete ? (
                'Setup Complete ✓'
              ) : (
                'Run Setup'
              )}
            </Button>
            
            {setupComplete && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/add'}
              >
                Add Your First Book
              </Button>
            )}
          </div>

          {/* What Will Be Created */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="font-medium text-blue-800 mb-2">📚 Preset Locations Created</div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• <strong>Living Room</strong> → Bookshelf → Top/Middle/Bottom Shelf</div>
              <div>• <strong>Bedroom</strong> → Nightstand</div>
              <div>• <strong>Home Office</strong> → Bookshelf</div>
              <div>• <strong>Study</strong> → Floor-to-Ceiling Shelf</div>
              <div>• <strong>Basement</strong> → Box A, Box B</div>
              <div>• <strong>Attic</strong> → Crate 1</div>
              <div>• <strong>Kitchen</strong> → Cookbook Shelf</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 