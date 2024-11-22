import { Link } from 'react-router-dom';

export default function HeaderPage() {
    return (
        <header style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e9ecef'
        }}>
            <nav>
                <ul style={{
                    display: 'flex',
                    listStyle: 'none',
                    gap: '1rem',
                    margin: 0,
                    padding: 0
                }}>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/signin">Login</Link></li>
                </ul>
            </nav>
        </header>
    );
}