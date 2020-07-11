import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'atoms'
import classNames from 'classnames'
import styles from './scripture-section.module.scss'
import { isEmpty } from 'lodash'

class ScriptureSection extends Component {

	constructor(props) {
		super(props)
		this.state = {
			scripture: ''
		}
	}

	async componentDidMount() {
		const { address } = this.props
		const result = await fetch(`https://bible-api.com/${encodeURIComponent(address)}?translation=kjv`, {
			method: 'GET'
		}).then( response => response.json() ).catch( error => {
			console.error(error)
		})
		const scripture = `<p>${result.text.split("\n").join("<br/>")}</p>`
		this.setState( { scripture })
	}

	render() {
			const { scripture } = this.state
			const { address, isModal } = this.props
			const className = classNames({
			[styles.scriptureSection]: true,
			[styles.brighten]: !isModal && typeof window !== `undefined` && window.location.pathname.includes('/i/')
		})
		return (
			<div className={className}>
				<div className="row">
					<div className="col-sm-3">
						<Button
							fontIcon='scroll'
							label={address}
							onClick={ e => {
								const url = `https://www.biblegateway.com/passage/?search=${address}&version=KJV`
								window.open(url, '_blank')
							}}
						/>
					</div>
					<div className="col-sm-9">
						<div dangerouslySetInnerHTML={{'__html': scripture }} />
					</div>
				</div>
			</div>
		)
	}
}
ScriptureSection.propTypes = {
	address: PropTypes.string,
}
ScriptureSection.defaultProps = {
	address: '',
}
export default ScriptureSection