// Lib
import { defineComponent } from 'vue';

// Components
import { DwContainer } from '../DwContainer';

// Styles
import './styles.scss';

export const DwHeader = defineComponent({
  name: 'DwHeader',

  render() {
    return (
      <div class="header">
        <DwContainer>
          <router-link to="/">Logo</router-link>
        </DwContainer>
      </div>
    );
  }
});
