import React from 'react';

function China() { // Capitalized name
  return (
    <div className="china"> {/* Changed 'class' to 'className' */}
      <iframe style={{"width": "1900px", "height": "1080px"}} src="https://www.bilibili.com/blackboard/live/live-activity-player.html?cid=1786339354&quality=0" frameborder="no"    framespacing="0" scrolling="no" allow="autoplay; encrypted-media" allowfullscreen="true"></iframe>
    </div>
  );
};

export default China;