/**
 * Created by AntonioGiordano on 06/07/16.
 */

import PropTypes from 'prop-types'
import bind from 'autobind-decorator'
import { Children, Component, createElement } from 'nervjs'

export class HashRouter extends Component {
	constructor(props) {
		super(props)

		this.locations = []
		this.scores = []
		this.children = []
		this.params = []
		this._childKey = null
		this._params = []

		this.calcChildren(this.props)
		this.state = {
			render: this._matchedPage(),
		}
	}

	@bind
	onHashChange() {
		const render = this._matchedPage()
		if (render === null) return

		this.props.onLocationChanged(this._childKey, this._params, () => {
			this.setState(() => ({
				render,
			}))
		})
	}

	@bind
	_matchedPage() {
		const hash = window.location !== undefined ? window.location.hash : '#/'
		const locArray = hash.split('/')
		if (locArray.length !== 0 && locArray[0] === '#') locArray.shift()

		let locations = this.locations
		let scores = this.scores
		let children = this.children
		let params = this.params

		let i
		for (i = 0; i < locations.length; i++) {
			if (locations[i].length !== locArray.length) {
				locations = locations.slice(i, 1)
				scores = scores.slice(i, 1)
				children = children.slice(i, 1)
				params = params.slice(i, 1)
				i--
			}
		}

		const regexParam = /^{(.*)}$/
		for (i = 0; i < locArray.length; i++) {
			for (var j = 0; j < locations.length; j++) {
				if (locArray[i] === locations[j][i]) {
					scores[j] += 100
				} else if (locations[j][i].match(regexParam, '$1') !== null) {
					scores[j] += 1
					params[j][locations[j][i].match(regexParam, '$1')[1]] = locArray[i]
				} else {
					locations.splice(j, 1)
					scores.splice(j, 1)
					children.splice(j, 1)
					params.splice(j, 1)
					j--
				}
			}
		}

		if (locations.length !== 0) {
			let max = 0
			let maxId = 0
			for (i = 0; i < scores.length; i++) {
				if (scores[i] > max) {
					max = scores[i]
					maxId = i
				}
			}

			this._childKey = children[maxId].key
			this._params = params[maxId]

			return children[maxId]
		}
		return null
	}

	@bind
	calcChildren(props) {
		Children.forEach(props.children, child => {
			const childArray = child.props.hash.split('/')
			if (childArray.length !== 0) childArray.shift()
			this.locations.push(childArray)
			this.scores.push(0)
			this.children.push(child)
			this.params.push({})
		})
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextState.render !== this.state.render) return true
		if (nextProps.onLocationChanged !== this.props.onLocationChanged) return true
		return false
	}

	componentWillReceiveProps(nextProps) {
		this.calcChildren(nextProps)
	}

	componentDidMount() {
		this.onHashChange()
		window.addEventListener('hashchange', this.onHashChange)
	}

	componentWillUnmount() {
		this.locations = null
		this.scores = null
		this.children = null
		this.params = null
		this._childKey = null
		this._params = null
		window.removeEventListener('hashchange', this.onHashChange)
	}

	render() {
		return this.state.render
	}
}

HashRouter.propTypes = {
	onLocationChanged: PropTypes.func,
}

HashRouter.defaultProps = {
	onLocationChanged: (childKey, params, cb) => cb(),
}

export const Route = props => <div>{props.children}</div>

Route.propTypes = {
	key: PropTypes.string.isRequired,
	hash: PropTypes.string.isRequired,
}
