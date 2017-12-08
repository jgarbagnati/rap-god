import Inferno from 'inferno';
import Component from 'inferno-component';

export default class Boteezy extends Component {
	constructor(props) {
		super(props);
		
		this.state = {}
	}
	
	render() {
		return (
			<div id='inferno-root'>
			</div>
		);
	}
}

Inferno.render(
	<Boteezy />,
	document.getElementById('root')
);
