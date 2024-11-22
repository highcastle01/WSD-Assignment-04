import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import App from './App';

test('renders app', () => {
  const router = createMemoryRouter([
    {
      path: "/",
      element: <App />,
    },
  ]);

  render(<RouterProvider router={router} />);
});