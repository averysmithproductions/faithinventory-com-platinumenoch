import React, { Component, Fragment } from 'react'
import { ImageUploader, Select, SubmitButton, Textarea, Textfield, Toast } from 'atoms'
import { AuthorInventoryMenu, AuthorMoreMenu } from 'molecules'
import styles from './author-item-manager.module.scss'
import './author-item-manager.scss'
import { isEqual, isEmpty } from 'lodash'
import AveryGoodAuthenticator from '../../../assets/js/averygoodauthenticator'
import toastedNotes from 'toasted-notes' 
import { navigate } from 'gatsby'

const TOAST_DURATION = 4000 // 4 seconds
const getDelimitedStringOfIds = (keys, delimiter) => {
	let ids = ''
	keys.forEach( (id, i) => {
		const key = id.split('inventory/items/')[1].split('.jpg')[0]
		ids += i === 0 ? key : `${delimiter}${key}`
	})
	return ids
}
class AuthorItemManager extends Component {
	constructor(props) {
		super(props)
		this.state = {
			allCategories: [],
			categoriesValue: [],
			imagesValue: {},
			inventoryItems: [],
			LOADING_STATE: 'unloaded',
			moreInfoUrlValue: '',
			moreMenuItems: [],
			previouslySavedImageFilenames: [],
			previouslySavedImagesValue: {},
			priceValue: -1,
			s3: [],
			scriptureAddressValue: '',
			selectedItem: {},
			summaryValue: '',
			titleValue: ''
		}
	}
	componentDidMount() {
		// set categories, inventory items, "more" menu items
		const { allInventoryItems, s3 } = this.props
		const categoryNames = {}
		const inventoryItems = allInventoryItems.map( ({ node }) => {
			const item = {
				...node,
				onClick: e => {
					this.navigateToSelectedItemPage(e.slugId)
				}
			}
			// collect category names
			item.categories.forEach( category => categoryNames[category] = true )
			return item
		})
		const allCategories = Object.keys(categoryNames).map( category => ({ value: category, label: category }) )
	    const moreMenuItems = [{
	    	fontIcon: 'trash-bin',
	    	onClick: () => {
	    		const isConfirmed = confirm('Are you sure you want to delete this item?')
	    		if (isConfirmed) {
		    		this.deleteSelectedItem()
		    	}
	    	},
	    	title: 'Delete Item'
	    }]
	    const state = {
	    	allCategories,
	    	inventoryItems,
	    	moreMenuItems,
	    	s3
	    }
	    if (this.props.mode === 'UPDATE') {
	    	const { selectedItem } = this.props
	    	state.categoriesValue = selectedItem.categories
			state.moreInfoUrlValue = selectedItem.moreInfoUrl
			state.priceValue = selectedItem.price
			state.selectedItem = selectedItem
			state.summaryValue = selectedItem.summary
			state.titleValue = selectedItem.title
			state.scriptureAddressValue = selectedItem.scriptureAddress
	    }
	    this.setState({ ...state })
	}
	navigateToNewItemPage() {
		navigate('/author/items/')
	}
	navigateToSelectedItemPage(id) {
		navigate(`/author/items/${id}/`)
	}
	refreshPage() {
		document.location.href = document.location.origin + document.location.pathname
	}
	saveItemData() {
		const { mode } = this.props
		const {
			categoriesValue,
			imagesValue,
			moreInfoUrlValue,
			previouslySavedImageFilenames,
			previouslySavedImagesValue,
			priceValue,
			scriptureAddressValue,
			selectedItem,
			summaryValue,
			titleValue
		} = this.state
		// create parameters object
		const params ={}
		const preparePropToBeUpdated = (name, value) => {
			if ((isNaN(value) && !isEmpty(value)) || !isNaN(value)) {
				params[name] = value
			}
        }
		preparePropToBeUpdated('title', titleValue)
		preparePropToBeUpdated('summary', encodeURIComponent(decodeURIComponent(summaryValue)))
		preparePropToBeUpdated('categories', categoriesValue)
		preparePropToBeUpdated('price', priceValue)
		preparePropToBeUpdated('moreInfoUrl', moreInfoUrlValue)
		scriptureAddressValue && preparePropToBeUpdated('scriptureAddress', scriptureAddressValue)
		try {
			// validate parameters
			const keys = [
                'title',
                'summary',
                'categories',
                'price',
                'moreInfoUrl'
            ]
            for (let i = 0; i < keys.length; i++) {
            	const key = keys[i]
                const param = params[key]
                if (!param) {
                    throw `'${keys[i]}' parameter is required.`
                }
            }
            if (mode === 'CREATE') {
	        	if (!imagesValue.files) {
	        		throw "'images' parameter is required."
	        	}
            }
            this.setState({ LOADING_STATE: 'loading' }, async () => {
				const { getStorage } = AveryGoodAuthenticator.utils
				const headers = {
					'Content-Type': 'application/json',
					'Authorization': getStorage('authorizationHash'),
					'x-api-key': process.env.GATSBY_THALLIUMELI_API_KEY
				}
				// if there are images and these images have not been previously uploaded AND they should be uploaded 
					// get s3 pre-signed upload urls
						// normalize image file names
						// upload images to s3
				// else if there is a key order
					// update images param with key order
				const { files, keyOrder } = imagesValue
				if (files && !isEqual(files, previouslySavedImagesValue.files)) {
					// retrieve s3 upload urls
					let result = await fetch(`/api/1/admin/inventory/s3/urls?amount=${files.length}`, {
						method: 'GET',
						headers
					}).then( response => {
						// if access is unauthorized
							// sign out
						if(response.status === 401) {
							AveryGoodAuthenticator.signOut()
						}
						return response
					}).catch( error => {
						console.error(error)
					})
					const s3UrlData = await result.json()
					// rename files to s3 file names
					// upload to s3
					const renameFiles = (newFilenames, originalFiles) => {
						const newFiles = []
						for (let i = 0; i < newFilenames.length; i++) {
							const originalFile = originalFiles[i]
							const newFilename = newFilenames[i]
							const newFile = new File([originalFile], newFilename, { type: originalFile.type })
							newFiles.push(newFile)
						}
						return newFiles
					}
					const uploadFilesToS3 = (urls, imageFiles) => {
						for (let i = 0; i < urls.length; i++) {
							fetch(urls[i], {
								method: 'PUT',
								headers: {
									'Content-Type': imageFiles[i].type
								},
								body: imageFiles[i]
							})
						}
					}
					const renamedFiles = renameFiles(s3UrlData.map( datum => datum.photoFilename ), files)
					uploadFilesToS3(s3UrlData.map( datum => datum.uploadURL ), renamedFiles)
					params['images'] = renamedFiles.map( file => `inventory/items/${file.name}` )
				} else if (keyOrder) {
					params['images'] = keyOrder
				}
				// notify user of loading state
				let closeNotification
				toastedNotes.notify(({ onClose }) => {
				closeNotification = onClose
					const message = mode === 'CREATE' ? 'Item Being Created...' : 'Item Being Updated...'
					return <Toast message={message} loadingState="loading" />
				}, {
					duration: null
				})
				if (mode === 'CREATE') {
					fetch(`/api/1/admin/inventory/item`, {
						method: 'POST',
						headers,
						body: JSON.stringify(params),
					}).then( response => {
						// if access is unauthorized
							// sign out
						if(response.status === 401) {
							AveryGoodAuthenticator.signOut()
						}
						return response.json()
					}).then( response => {
						let message
						if (response.error) {
							message = response.error
						} else {
							message = "Item Created!"
						}
						this.setState({ LOADING_STATE: 'loaded' }, () => {
							closeNotification()
							toastedNotes.notify(<Toast message={message} fontIcon="inventory-item" />, { duration: TOAST_DURATION })
							const delayFormResetToPreventTooManySubmissions = setTimeout(() => {
								//this.setState({ LOADING_STATE: 'unloaded' })
								//clearTimeout(delayFormResetToPreventTooManySubmissions)
								this.refreshPage()
							}, TOAST_DURATION)
						})
					}).catch( error => {
						console.error( error )
					})
				} else if (mode === 'UPDATE') {
					fetch(`/api/1/admin/inventory/items/${selectedItem.alternative_id}`, {
						method: 'PUT',
						headers,
						body: JSON.stringify(params),
					}).then( response => {
						// if access is unauthorized
							// sign out
						if(response.status === 401) {
							AveryGoodAuthenticator.signOut()
						}
						return response
					}).then( response => {
						let message
						const state = {
							LOADING_STATE: 'loaded'
						}
						if (response.error) {
							message = response.error
						} else {
							message = "Item Updated!"
							if (previouslySavedImagesValue) {
								state.previouslySavedImagesValue = Object.assign({}, imagesValue )
							}
							if (params['images']) {
								state.previouslySavedImageFilenames = params['images'].slice()
							}
						}
						this.setState({ ...state }, () => {
							closeNotification()
							toastedNotes.notify(<Toast message={message} fontIcon="inventory-item" />, { duration: TOAST_DURATION })
							const delayFormResetToPreventTooManySubmissions = setTimeout(() => {
								this.setState({ LOADING_STATE: 'unloaded' })
								if (!response.error) {
									// store files to be deleted
									// for each selectedItem.images file name
										// if not found in imagesValue.files
											// store in toBeDeleted list
									const imageFilenames = !isEmpty(previouslySavedImageFilenames) ? previouslySavedImageFilenames : selectedItem.images
									const imagesToBeDeleted = imageFilenames.filter( key => !params['images'].includes(key) )
									const deleteUnusedImagesFromS3 = ids => {
										fetch(`/api/1/admin/inventory/s3/images?ids=${ids}`, {
											method: 'DELETE',
											headers
										}).catch( error => {
											console.error(error)
										}) 
									}
									if (!isEmpty(imagesToBeDeleted)) {
										const ids = getDelimitedStringOfIds(imagesToBeDeleted, ',')
										deleteUnusedImagesFromS3(ids)
									}
								}
								clearTimeout(delayFormResetToPreventTooManySubmissions)
							}, TOAST_DURATION)
						})
					}).catch( error => {
						console.error( error )
					})
				}
			})
		} catch ( error ) {
			toastedNotes.notify(<Toast message={error} fontIcon="inventory-item" />, { duration: 2000 })
		}
	}
	async deleteSelectedItem() {
		this.setState( { LOADING_STATE: 'loading' }, () => {
			let closeNotification
			toastedNotes.notify(({ onClose }) => {
				closeNotification = onClose
				return <Toast message="Item Deleting..." loadingState="loading" />
			}, {
				duration: null
			})
			const { getStorage } = AveryGoodAuthenticator.utils
			const headers = {
				'Content-Type': 'application/json',
				'Authorization': getStorage('authorizationHash'),
				'x-api-key': process.env.GATSBY_THALLIUMELI_API_KEY
			}
			const {
				selectedItem
			} = this.state
			const ids = getDelimitedStringOfIds(selectedItem.images, ',')
			fetch(`/api/1/admin/inventory/s3/images?ids=${ids}`, {
				method: 'DELETE',
				headers
			}).then( response => {
				// if access is unauthorized
					// sign out
				if(response.status === 401) {
					AveryGoodAuthenticator.signOut()
				}
			}).catch( error => {
				console.error(error)
			})
			fetch(`/api/1/admin/inventory/items/${selectedItem.alternative_id}`, {
				method: 'DELETE',
				headers
			}).then( result => {
				closeNotification()
				toastedNotes.notify(<Toast message="Item Deleted!" />, { duration: TOAST_DURATION })
				navigate('/author/items/', { replace: true })
			}).catch( error => {
				console.error(error)
			})
		})
	}
	render() {
		const { mode } = this.props
		const {
			allCategories,
			inventoryItems,
			LOADING_STATE,
			moreMenuItems,
			s3,
			selectedItem
		} = this.state
		return (
			<Fragment>
				<div className={styles.window}>
					<div className={styles.menu}>
						<h2>Manage Inventory Items</h2>
						{!isEmpty(inventoryItems) && <AuthorInventoryMenu selectedItem={selectedItem} items={inventoryItems} onPlusButtonClick={() => this.navigateToNewItemPage() } />}
					</div>
					<div className={styles.info}>
						<div className="wrapper">
							<div className="row">
								<div className="col-xs-12 col-sm-offset-2 col-sm-8">
									<div className={styles.content}>
										<form>
											{mode === 'CREATE' && <Fragment>
												<h2>Create New Item</h2>
												<Textfield
													label="title (required)"
													type="text"
													placeholder="title of item goes here"
													onChange={e => {
														this.setState({ titleValue: e.target.value })
													}}
												/>
												<Textarea
													label="summary (required)"
													placeholder="summary of item goes here"
													onChange={e => {
														this.setState({ summaryValue: e.target.value })
													}}
												/>
												<Textfield
													label="scripture (optional). For now this can only support references from the 66 Books of the Protestant Canon."
													type="text"
													placeholder="Matthew 6:2-8"
													onChange={e => {
														this.setState({ scriptureAddressValue: e.target.value })
													}}
												/>
												<Select
													label="categories (required)"
													placeholder="select..."
													options={allCategories}
													onChange={categories => {
														this.setState({ categoriesValue: categories })
													}}
												/>
												<Textfield
													label="price (required)"
													type="number"
													placeholder="5.00"
													onChange={e => {
														this.setState({ priceValue: Number(e.target.value) })
													}}
												/>
												<Textfield
													label="link for more info (required)"
													type="text"
													placeholder="https://amazon.com/some-link"
													onChange={e => {
														this.setState({ moreInfoUrlValue: e.target.value })
													}}
												/>
												<ImageUploader label="images (at least 1 required)" onChange={ images => this.setState({ imagesValue: images }) } />
											</Fragment>}
											{mode === 'UPDATE' && <Fragment>
												{!isEmpty(selectedItem) && <Fragment>
													<div className={styles.topFormArea}>
														<h2>Edit Item</h2>
														<AuthorMoreMenu items={moreMenuItems} />
													</div>
													<Textfield
														label="title (required)"
														type="text"
														placeholder="title of item goes here"
														defaultValue={selectedItem.title}
														onChange={e => {
															this.setState({ titleValue: e.target.value.toLowerCase() })
														}}
													/>
													<Textarea
														label="summary (required)"
														placeholder="summary of item goes here"
														defaultValue={decodeURIComponent(selectedItem.summary)}
														onChange={e => {
															this.setState({ summaryValue: e.target.value })
														}}
													/>
													<Textfield
														label="scripture (optional, can only support references from the 66 books of the protestant canon for now)"
														type="text"
														placeholder="Matthew 6:2-8"
														defaultValue={selectedItem.scriptureAddress}
														onChange={e => {
															this.setState({ scriptureAddressValue: e.target.value })
														}}
													/>
													<Select
														label="categories (required)"
														placeholder="select..."
														options={allCategories}
														defaultValue={selectedItem.categories.map( category => ({ value: category, label: category }) )}
														onChange={categories => {
															this.setState({ categoriesValue: categories })
														}}
													/>
													<Textfield
														label="price (required)"
														type="number"
														placeholder="5.00"
														defaultValue={selectedItem.price}
														onChange={e => {
															this.setState({ priceValue: Number(e.target.value) })
														}}
													/>
													<Textfield
														label="link for more info (required)"
														type="text"
														placeholder="https://amazon.com/some-link"
														defaultValue={selectedItem.moreInfoUrl}
														onChange={e => {
															this.setState({ moreInfoUrlValue: e.target.value })
														}}
													/>
													{<ImageUploader
														label="images (at least 1 required)"
														defaultValue={ selectedItem.images.map( (key, i) => ({ key, publicURL: s3[i].publicURL }) )}
														onChange={ images => this.setState({ imagesValue: images }) }
													/>}
												</Fragment>}
											</Fragment>}
											<div className={styles.bottomFormArea}>
												<SubmitButton
													value={mode}
													onClick={ e => {
														e.preventDefault()
														this.saveItemData()
													}}
													onKeyPress= { e => {
														e.preventDefault()
														if (e.key === 'Enter') {
															this.saveItemData()
														}
													}}
													isDisabled={LOADING_STATE !== 'unloaded'}
												/>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Fragment>
		)
	}
}
export default AuthorItemManager