import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Marketing } from './routes/Marketing';
import { StyleGuideLayout } from './routes/StyleGuideLayout';
import { StyleGuideIndex } from './routes/styleguide/Index';
import { Colors } from './routes/styleguide/Colors';
import { Typography } from './routes/styleguide/Typography';
import { ButtonPage } from './routes/styleguide/components/ButtonPage';
import { ChipPage } from './routes/styleguide/components/ChipPage';
import { NavBarPage } from './routes/styleguide/components/NavBarPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Marketing />} />
        <Route path="/style-guide" element={<StyleGuideLayout />}>
          <Route index element={<StyleGuideIndex />} />
          <Route path="colors" element={<Colors />} />
          <Route path="typography" element={<Typography />} />
          <Route path="components/chip" element={<ChipPage />} />
          <Route path="components/button" element={<ButtonPage />} />
          <Route path="components/nav-bar" element={<NavBarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
