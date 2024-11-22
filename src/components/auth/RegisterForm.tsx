import { useState, FormEvent, ChangeEvent } from 'react';

interface User {
  id: string;
  password: string;
}

interface RegisterFormProps {
  onSuccess: () => void;
  onFailure: (error: Error) => void;
}

export default function RegisterForm({ onSuccess, onFailure }: RegisterFormProps) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
            const userExists = users.some(user => user.id === email);

            if (userExists) {
                throw new Error('유저가 이미 존재합니다.');
            }

            const newUser = { id: email, password: password};
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            onSuccess();
        } catch (err) {
            onFailure(err as Error);
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
          <button type="submit">Register</button>
        </form>
    );
};