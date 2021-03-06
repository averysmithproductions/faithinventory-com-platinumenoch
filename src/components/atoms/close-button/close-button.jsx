import React from 'react'
import PropTypes from 'prop-types'
import styles from './close-button.module.scss'

const CloseButton = ({ onClick, onKeyPress }) => (
	<button
		className={styles.closeButton}
		onClick={onClick}
		onKeyPress={onKeyPress}
	>
		<i className="font-icon-close" />
	</button>
)
CloseButton.propTypes = {
  onClick: PropTypes.func,
  onKeyPress: PropTypes.func
}
CloseButton.defaultProps = {
  onClick: () => {},
  onKeyPress: () => {}
}
export default CloseButton