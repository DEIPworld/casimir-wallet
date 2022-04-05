// Lib
import { defineComponent } from 'vue';

// Components
import Container from '../Container';

// Styles
import './styles.scss';

const Header = defineComponent({
  name: 'Header',

  render() {
    return (
      <div class="header">
        <Container>
          <router-link to="/">Logo</router-link>
        </Container>
      </div>
    );
  },
});

export default Header;
