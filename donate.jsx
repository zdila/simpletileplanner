const React = require('react');

function Donate() {
  return (
    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" className="donate">
      <input type="hidden" name="cmd" value="_s-xclick"/>
      <input type="hidden" name="hosted_button_id" value="5E5GNZUBJA2YL"/>
      <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" name="submit" alt="PayPal - The safer, easier way to pay online!"/>
    </form>
  );
}

module.exports = Donate;
