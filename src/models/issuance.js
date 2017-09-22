import DefineMap from 'can-define/map/'
import DefineList from 'can-define/list/list'
import feathersClient from '~/models/feathers-client'
import superModel from '~/models/super-model'
import algebra from '~/models/algebra'

const Issuance = DefineMap.extend('Issuance', {
  _id: 'string',

  /**
   * Id of the user who created the issuance
   */
  userId: 'string',
  index: 'number',

  companyId: 'string',
  companyName: 'string',
  companySlug: 'string',
  domicile: 'string',
  issuanceName: 'string',
  issuanceType: 'string',
  issuanceUnit: 'string',   // ['SHARES', 'BTC', 'UNITS'] ?
  restriction: 'string',
  marketCap: 'number',
  change: 'number',
  changePercentage: 'number',

  // 24h stat data:
  highestBid: 'number',
  lowestAsk: 'number',
  highestNumShares: 'number',
  lowestNumShares: 'number',

  // meta data:
  volume24h: 'number',
  sharesAuthorized: 'number',
  sharesIssued: 'number',
  sharesDividend: 'number',
  sharesDividendYield: 'number',

  tradesNum: 'number',

  // ENUM ('Common Shares' | '')
  type: 'string',

  // extras:
  selected: {
    type: 'boolean',
    serialize: false
  },
  // helper prop for selected item of the dropdown list of Issuance.types
  issuanceTypeItem: {
    type: '*',
    serialize: false,
    set (val) {
      if (val && val.type) {
        this.issuanceType = val.type
      }
      return val
    }
  },
  selectedCompany: {
    serialize: false,
    set (company) {
      if (company) {
        this.companyId = company._id
        this.companyName = company.name
        this.companySlug = company.slug
        this.domicile = company.domicile
      }
      return company
    }
  },
  getJson () {
    const company = this.selectedCompany
    return {
      company: {
        registration_number: (company.registrationNumber || 'no-registration-number'),
        jurisdiction_country: company.domicile,
        jurisdiction_state_or_province: company.state,
        legal_name: company.name,
        address: company.streetAddress + ' ' + company.streetAddress2,
        city: company.city,
        state_or_province: company.state,
        zip_or_postal_code: company.postalCode,
        country: company.domicile,
        web: company.website,
        public_key_web: company.website,
        email: company.contactEmail,
        phone: company.phoneNumber
      },
      issuance: {
        issuance_public_key: '025194773f4d9a3cd8ea9e017d634df99044ab8074ef8a06b583d6663fb08f5d68',
        issuance_name: this.issuanceName,
        issuance_date: Math.floor(Date.now() / 1000),
        restriction_level: (this.restriction || 0),
        security_type: this.issuanceType
      }
    }
  }
})

// "common_shares", "fund_units", "partnership_units", "trust_units", "preferred_shares" or "bonds"
Issuance.types = new DefineList([
  { name: 'Common Shares', type: 'common_shares' },
  { name: 'Preferred Shares', type: 'preferred_shares' },
  { name: 'Trust Units', type: 'trust_units' },
  { name: 'Partnership Units', type: 'fund_units' },   // <<< TODO ??? check type/name
  { name: 'Bonds', type: 'bonds' }
])

Issuance.List = DefineList.extend('IssuanceList', {
  '#': Issuance,
  // Every new issuance requires a new index for its EQB address.
  getNewIndex () {
    return this.reduce((acc, issuance) => {
      if (issuance.index > acc) {
        acc = issuance.index
      }
      return acc
    }, 0)
  }
})

Issuance.connection = superModel({
  Map: Issuance,
  List: Issuance.List,
  feathersService: feathersClient.service('/issuances'),
  name: 'issuances',
  algebra
})

Issuance.algebra = algebra

export default Issuance
