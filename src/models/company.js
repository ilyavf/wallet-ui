import DefineMap from 'can-define/map/'
import DefineList from 'can-define/list/list'
import feathersClient from './feathers-client'
import superModel from './super-model'
import algebra from './algebra'
import Session from './session'

const Company = DefineMap.extend('Company', {
  requiredFields: ['name', 'domicile', 'streetAddress', 'city', 'state', 'postalCode']
}, {
  _id: 'string',
  userId: 'string',
  index: 'number',

  name: 'string',
  slug: 'string',
  domicile: 'string',

  streetAddress: 'string',
  streetAddress2: 'string',
  city: 'string',
  state: 'string',
  postalCode: 'string',

  contactEmail: 'string',
  website: 'string',
  phoneNumber: 'string',

  error: {
    type: 'string',
    serialize: false
  },

  validateAndSave () {
    this.error = ''
    if (!this.userId && Session.current && Session.current.user) {
      this.userId = Session.current.user._id
    }
    if (this.hasErrors()) {
      this.error = this.validationError
      return Promise.reject(new Error(this.error))
    }
    return this.save()
  },

  hasErrors () {
    return Company.requiredFields.reduce((acc, prop) => (acc || !this[prop]), false)
  },

  validationError: {
    get () {
      return Company.requiredFields.reduce((acc, prop) => (acc || (!this[prop] && `${prop} is required`)), '')
    }
  }
})

Company.List = DefineList.extend('CompanyList', {
  '#': Company
})

Company.connection = superModel({
  Map: Company,
  List: Company.List,
  feathersService: feathersClient.service('/companies'),
  name: 'companies',
  algebra
})

Company.algebra = algebra

export default Company
