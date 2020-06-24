import React, { Component, Fragment } from 'react'
import { Excerpt, TaxonomyFilter } from 'molecules'
import PropTypes from 'prop-types'

let amountIterator
class ExcerptCollection extends Component {
	constructor(props) {
		super(props)
		this.state ={
			amountToShow: 3,
		}
		amountIterator = this.state.amountToShow
	}
	componentDidMount() {
		window.addEventListener("scroll", this.handleScroll)
		this.shouldUpdate = true
		this.update()
		// reach router doesn't trigger a browser refresh, therefore the scrollTo Y position never resets
		// therefore, manualy reset scroll position on blog index render
		window.scrollTo(0,0)
	}
	update() {
		const distanceToBottom = document.documentElement.offsetHeight - (window.scrollY + window.innerHeight)
		if (distanceToBottom < 100) {
			this.setState({ amountToShow: this.state.amountToShow + amountIterator })
		}
		this.ticking = false
	}
	handleScroll = () => {
		if (!this.ticking) {
			this.ticking = true
			requestAnimationFrame(() => {
				if (this.shouldUpdate) {
					this.update()
				}
			})
		}
	}
	componentWillUnmount() {
		this.shouldUpdate = false
	}
	render() {
		const { postExcerpts, s3, taxonomies, location } = this.props
		const { amountToShow, isShowingMore } = this.state
		const excerpts = postExcerpts.slice(0, amountToShow)

		return (
			<Fragment>
				{taxonomies.length > 0 && <TaxonomyFilter location={location} taxonomies={taxonomies} />}
				{excerpts.map( ({ node: { excerpt, frontmatter: { author, coverPhoto, date, slug, title } } }, i) => (
				    <Excerpt
				        key={i}
				        author={author}
				        date={date}
				        img={s3[coverPhoto].childImageSharp.fluid}
				        summary={excerpt}
				        title={title}
				        url={`/blog/${slug}/`}
			        />)
				)}
			</Fragment>
		)
	}
}
ExcerptCollection.propTypes = {
	postExcerpts: PropTypes.array,
	taxonomies: PropTypes.array
}
ExcerptCollection.defaultProps = {
	postExcerpts: [],
	taxonomies: []
}
export default ExcerptCollection