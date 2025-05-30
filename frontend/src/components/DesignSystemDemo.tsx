import { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card'
import { Badge } from './ui/Badge'
import { Header } from './layout/Header'
import { Sidebar } from './layout/Sidebar'
import { 
  PlusIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  HeartIcon 
} from '@heroicons/react/24/outline'

export function DesignSystemDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-off-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-off-white">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-dark-charcoal mb-2">
                Banrimkwae Resort Design System
              </h1>
              <p className="text-medium-gray">
                A comprehensive UI component library built with React, TypeScript, and Tailwind CSS
              </p>
            </div>

            {/* Color Palette */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>Brand colors and status indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-20 bg-resort-blue-500 rounded-lg flex items-center justify-center text-white font-medium">
                      Resort Blue
                    </div>
                    <p className="text-sm text-gray-600">#2E86AB</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 bg-forest-green-500 rounded-lg flex items-center justify-center text-white font-medium">
                      Forest Green
                    </div>
                    <p className="text-sm text-gray-600">#A23B72</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 bg-warm-orange-500 rounded-lg flex items-center justify-center text-white font-medium">
                      Warm Orange
                    </div>
                    <p className="text-sm text-gray-600">#F18F01</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 bg-sunset-red-500 rounded-lg flex items-center justify-center text-white font-medium">
                      Sunset Red
                    </div>
                    <p className="text-sm text-gray-600">#C73E1D</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Various button styles and sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-3">Variants</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="accent">Accent</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                      <Button variant="destructive">Destructive</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-3">Sizes</h4>
                    <div className="flex flex-wrap gap-3 items-center">
                      <Button size="sm">Small</Button>
                      <Button size="default">Default</Button>
                      <Button size="lg">Large</Button>
                      <Button size="xl">Extra Large</Button>
                      <Button size="icon">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-3">With Icons</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button leftIcon={<PlusIcon className="h-4 w-4" />}>
                        Add User
                      </Button>
                      <Button variant="outline" rightIcon={<HeartIcon className="h-4 w-4" />}>
                        Like
                      </Button>
                      <Button loading>Loading...</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Inputs */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Form Inputs</CardTitle>
                <CardDescription>Input fields with various states</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input 
                      label="Default Input" 
                      placeholder="Enter text..." 
                      helperText="This is a helper text"
                    />
                    <Input 
                      label="Required Input" 
                      placeholder="Enter required text..." 
                      required
                    />
                    <Input 
                      label="Input with Error" 
                      placeholder="Enter text..." 
                      error="This field is required"
                    />
                    <Input 
                      label="Success Input" 
                      placeholder="Enter text..." 
                      variant="success"
                      value="Valid input"
                    />
                  </div>
                  <div className="space-y-4">
                    <Input 
                      label="Input with Left Icon" 
                      placeholder="Search..." 
                      leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
                    />
                    <Input 
                      label="Input with Right Icon" 
                      placeholder="Username" 
                      rightIcon={<UserIcon className="h-4 w-4" />}
                    />
                    <Input 
                      label="Small Input" 
                      placeholder="Small size..." 
                    />
                    <Input 
                      label="Large Input" 
                      placeholder="Large size..." 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium mb-3">Variants</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="primary">Primary</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="accent">Accent</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="error">Error</Badge>
                      <Badge variant="info">Info</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-3">Sizes</h4>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge size="sm">Small</Badge>
                      <Badge size="default">Default</Badge>
                      <Badge size="lg">Large</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>A basic card component</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This is the content area of a card. It can contain any type of content.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>Card with enhanced shadow</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This card has an elevated appearance with a stronger shadow effect.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">Learn More</Button>
                </CardFooter>
              </Card>

              <Card variant="outlined">
                <CardHeader>
                  <CardTitle>Outlined Card</CardTitle>
                  <CardDescription>Card with thick border</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This card features a thicker border for more definition.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm">Details</Button>
                </CardFooter>
              </Card>
            </div>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>Text styles and font hierarchy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h1 className="text-4xl font-bold text-dark-charcoal">Heading 1</h1>
                    <p className="text-sm text-gray-500">text-4xl font-bold</p>
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold text-dark-charcoal">Heading 2</h2>
                    <p className="text-sm text-gray-500">text-3xl font-semibold</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-dark-charcoal">Heading 3</h3>
                    <p className="text-sm text-gray-500">text-2xl font-medium</p>
                  </div>
                  <div>
                    <p className="text-base text-dark-charcoal">Body text - Regular paragraph text that provides information and context.</p>
                    <p className="text-sm text-gray-500">text-base</p>
                  </div>
                  <div>
                    <p className="text-sm text-medium-gray">Small text - Used for captions, helper text, and secondary information.</p>
                    <p className="text-sm text-gray-500">text-sm text-medium-gray</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
