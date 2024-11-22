import { render } from '@testing-library/react';
import App from './App';

// react-router-dom 모킹
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  createBrowserRouter: jest.fn(),
  RouterProvider: jest.fn(({ children }) => children)
}));

test('renders app', () => {
  render(<App />);
});