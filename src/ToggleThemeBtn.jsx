import React, { useEffect, useState } from 'react';

const ToggleThemeBtn = () => {
    const getPreferredTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark'; 
        }
        return 'light'; 
      };
    
      const [theme, setTheme] = useState(localStorage.getItem('theme') || getPreferredTheme());
    
      useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme); 
      }, [theme]);
    
      const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
      };
        
      return (
        <div style={{position:"fixed", top:"10px", left:"10px"}}>
          <button onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>
      );
    };

export default ToggleThemeBtn;