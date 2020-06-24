import React from 'react'
import PropTypes from 'prop-types'
import styles from './textfield.module.scss'

const Textfield = ({ label, onChange, onClick, onKeyPress, type, placeholder, isDisabled, defaultValue }) => (
	<label>
		<div className={styles.label}>{label}</div>
		<input
			className={styles.textfield}
			type={type}
			placeholder={placeholder}
			onClick={onClick}
			onKeyPress={onKeyPress}
			onChange={onChange}
			disabled={isDisabled ? "disabled" : false}
			defaultValue={defaultValue}
		/>
	</label>
)
Textfield.propTypes = {
	label: PropTypes.string,
	type: PropTypes.string,
	placeholder: PropTypes.string,
	onChange: PropTypes.func,
	onClick: PropTypes.func,
	onKeyPress: PropTypes.func,
	isDisabled: PropTypes.bool
}
Textfield.defaultProps = {
	label: "add label",
	type: "text",
	placeholder: "add placeholder",
	onChange: () => {},
	onClick: () => {},
	onKeyPress: () => {},
	isDisabled: false
}
export default Textfield