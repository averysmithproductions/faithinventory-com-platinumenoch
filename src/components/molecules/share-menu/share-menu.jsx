import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'atoms'
import AveryGoodNarrowcaster from '../../../assets/js/averygoodnarrowcaster'
import styles from './share-menu.module.scss'
import classNames from 'classnames'
import { isEmpty } from 'lodash'

const ShareMenu = ({ cn, url }) => {
	const menuData = [{
		fontIcon: 'envelope',
		label: "Email",
		service: 'email',
		message: `Hey,\n\ncheck this out: ${url}`
	}, {
		fontIcon: 'textsms',
		label: "SMS",
		service: 'sms',
		message: `Hey, check this out ${url}`
	}, {
		fontIcon: 'twitter',
		label: "Twitter",
		service: 'twitter',
		message: `Check this out: ${url} #believers #negroland #hebrew #jesus #noantiblackracism`
	}, {
		fontIcon: 'whatsapp',
		label: "Whatsapp",
		service: 'whatsapp',
		message: `Hey check this out: ${url}`
	}, {
		fontIcon: 'pinterest',
		label: "Pinterest",
		service: 'pinterest',
		message: `check out Melalogic #believers #negroland #hebrew #jesus #noantiblackracism`
	}, {
		fontIcon: 'facebook',
		label: "Facebook",
		service: 'facebook',
		message: `Hey check this out: ${url} #believers #negroland #hebrew #jesus #noantiblackracism`
	}]
	const buttons = menuData.map( ({ fontIcon, label, service, message }, i) => <li key={i}><Button
		fontIcon={fontIcon}
		label={""}
		onClick={ e => { 
			e.preventDefault()
			AveryGoodNarrowcaster.share(service, url, message)
		}}
	/></li>)

	const className = classNames({
		[styles.shareMenu]: true,
		[cn]: !isEmpty(cn)
	})

	return (
		<div className={className}>
			<ul>{buttons}</ul>
		</div>
	)
}

export default ShareMenu