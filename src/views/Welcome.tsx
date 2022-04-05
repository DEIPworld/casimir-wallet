// Lib
import { defineComponent } from 'vue';

// Components
import Container from '@/components/Container';
import Button from '@/components/Button';

const Welcome = defineComponent({
  name: 'Welcome',

  render() {
    return (
      <Container className="container--black">
        <Button>
          Create an account
        </Button>
        <Button className="button--transparent">
          Import an existing account
        </Button>
      </Container>
    );
  },
});

export default Welcome;
