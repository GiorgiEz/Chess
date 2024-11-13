import React from 'react';
import "./index.css"
import {RenderCanvas} from "./Game/RenderCanvas";

function App() {
  return (
      <div className='bg-gray-800 h-screen'>
          <RenderCanvas/>
      </div>
    )
}

export default App;
