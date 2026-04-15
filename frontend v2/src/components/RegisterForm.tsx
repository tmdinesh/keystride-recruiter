import React from 'react';

const RegisterForm: React.FC = () => {
  return (
    <form className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email address
        </label>
        <div className="mt-1">
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 sm:text-sm transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 sm:text-sm transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 sm:text-sm transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Register
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
