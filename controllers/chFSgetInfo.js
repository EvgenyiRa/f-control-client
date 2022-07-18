const configs=require('../configs/configs.js');

async function get(req, res) {
    try {
      if ((!!req.indexData.data.timeAll) & (!!req.indexData.lims.sys.TIME_ALL)) {
        const timeAll=req.indexData.data.timeAll/1000,
              limTimeAll=req.indexData.lims.sys.TIME_ALL;
        let limTimeDelta,
            limTimeDeltaH,
            limTimeDeltaMi,
            limTimeDeltaS;
        if (limTimeAll>0) {
              limTimeDelta=limTimeAll-timeAll,
              limTimeDeltaH=Math.trunc(limTimeDelta/3600),
              limTimeDeltaMi=Math.trunc((limTimeDelta % 3600)/60),
              limTimeDeltaS=Math.trunc((limTimeDelta % 3600) % 60);
        }
        else {
            limTimeDeltaH=24;
            limTimeDeltaMi=0;
            limTimeDeltaS=0;
        }
        const html=`<!DOCTYPE HTML>
<html lang="ru" prefix="og: https://ogp.me/ns#">
  <head>
      <meta charset="UTF-8"/>
      <title>Оставшееся время</title>
      <style>
        body, html {
          height: 100%
        }

        .bgimg {
          /* Background image */
          background-image: url('/w3images/forestbridge.jpg');
          /* Full-screen */
          height: 100%;
          /* Center the background image */
          background-position: center;
          /* Scale and zoom in the image */
          background-size: cover;
          /* Add position: relative to enable absolutely positioned elements inside the image (place text) */
          position: relative;
          /* Add a white text color to all elements inside the .bgimg container */
          color: white;
          /* Add a font */
          font-family: "Courier New", Courier, monospace;
          /* Set the font-size to 25 pixels */
          font-size: 25px;
        }

        /* Position text in the top-left corner */
        .topleft {
          position: absolute;
          top: 0;
          left: 16px;
        }

        /* Position text in the bottom-left corner */
        .bottomleft {
          position: absolute;
          bottom: 0;
          left: 16px;
        }

        /* Position text in the middle */
        .middle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        /* Style the <hr> element */
        hr {
          margin: auto;
          width: 40%;
        }
      </style>
  </head>
  <body>
    <script>
      const timerId = setInterval(()=> {
        location.reload();
      },3000);
    </script>
    <div class="middle">
    <h1>Осталось времени</h1>
    <hr>
    <p>`+limTimeDeltaH+':'+limTimeDeltaMi+':'+limTimeDeltaS+`</p>
  </div>
  </body>
</html>`;
        res.statusCode = 200;
        res.end(html);
      }
      else {
        res.statusCode = 404;
      }
      //res.status(404).end();
    } catch (err) {
      console.error(err);
    }
}

module.exports.get = get;
