import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
      <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to EduVision
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Unlock your potential with cutting-edge AI-powered learning tools and
          study guides.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/auth/register')}
            className="px-6 py-3 bg-blue-500 text-white font-medium text-lg rounded-md hover:bg-blue-600"
          >
            Register
          </button>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-gray-200 text-gray-800 font-medium text-lg rounded-md hover:bg-gray-300"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
