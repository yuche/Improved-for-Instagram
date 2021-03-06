import { Component, createElement } from 'nervjs'

export default class Dots extends Component {
	renderDot(i) {
		return <span className={'dots--dot m-1 ' + (i === this.props.index ? 'active' : '')} />
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.index !== this.props.index
	}

	render() {
		const { len } = this.props,
			dots = new Array(len)

		dots[0] = this.renderDot(0)
		for (let i = 1; i < len; ++i) {
			dots[i] = this.renderDot(i)
		}

		return <div className="dots d-flex justify-content-center">{dots}</div>
	}
}
