import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'atoms'
import { Header } from 'organisms'
import styles from './author-header.module.scss'
import AveryGoodAuthenticator from '../../../assets/js/averygoodauthenticator'

const signOut = () => {
  const { setCookie } = AveryGoodAuthenticator.utils
  setCookie('isSignedIn', true, 0)
  setCookie('authorizationHash', true, 0)
  // refresh the page and clear any search items appended to the url
  document.location.href = document.location.origin + document.location.pathname
}
const AuthorHeader = ({ authenticationState, sectionTitle, siteTitle, siteDescription }) => (
  <Header
    rightColElement={authenticationState === 'signedIn' ? (
      <Button
            cn={styles.authorHeaderButton}
            label="Sign Out"
            theme="red"
            onClick={ e => {
              e.preventDefault()
              const isConfirmed = confirm('Are you sure you want to sign out?')
              if (isConfirmed) {
                signOut()
              }
            }}
          />
    ) : null}
    sectionTitle={sectionTitle}
    siteTitle={siteTitle}
    siteDescription={siteDescription}
  />
)

AuthorHeader.propTypes = {
  authenticationState: PropTypes.string,
  siteTitle: PropTypes.string,
  siteDescription: PropTypes.string
}

AuthorHeader.defaultProps = {
  authenticationState: '',
  siteTitle: ``,
  siteDescription: ``
}

export default AuthorHeader