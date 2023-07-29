// @eslint-ignore
const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify Your Email</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f7f7f7;
      }
      header {
        background-color: #8b0000;
        color: #fff;
        padding: 20px;
      }
      h1 {
        margin: 0;
        font-size: 32px;
        text-align: center;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .center {
        text-align: center;
      }
      p {
        margin: 0 0 20px 0;
        font-size: 18px;
        line-height: 1.5;
      }
      .center a {
        display: inline-block;
        padding: 10px 20px;
        background-color: #8b0000;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
      }
      .center a:hover {
        background-color: #b20000;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Read Less: Verify Your Subscription</h1>
    </header>
    <div class="container">
      <p>
        Please click the button below to verify your subscription to the Read Less newsletter.
      </p>
      <p class="center">
        <a href="{{domain}}/verify?code={{verificationCode}}">
          Verify Subscription
        </a>
      </p>
      <p>If you did not request a newsletter subscription, please disregard this message or notify us via <a href='mailto:thecakeisalie@readless.ai'>thecakeisalie@readless.ai</a></p>
      <div class="center">
        <img src="{{domain}}/logo.svg" alt="Read Less Logo" />
        <p>Read Less</p>
      </div>
    </div>
  </body>
</html>
`;
export default html;