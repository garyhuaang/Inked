import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function App() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Inked</CardTitle>
          <CardDescription>
            Vite + React + Tailwind CSS + shadcn/ui
          </CardDescription>
          <CardAction>
            <Button variant="link" size="sm">
              Sign up
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full">Sign in</Button>
          <Button variant="outline" className="w-full">
            Continue with GitHub
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

export default App
