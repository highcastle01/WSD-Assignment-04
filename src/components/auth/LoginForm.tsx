import { useState, FormEvent, ChangeEvent } from 'react';

interface User {
  id: string;
  password: string;
}

interface LoginFormProps {
  onSuccess: (user: User) => void;
  onFailure: () => void;
}

export default function LoginForm({ onSuccess, onFailure } : LoginFormProps) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(user => user.id === email && user.password === password);

        if (user) {
            localStorage.setItem('TMDb-Key', user.password);
            onSuccess(user);
        } else {
            onFailure();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e:ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password" 
            value={password}
            onChange={(e:ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
    );
};