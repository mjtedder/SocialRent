//standard dependencies
import React, { Component } from 'react'
//import images
import Logo from '../../images/logo_transparent.png'
//semantic components
import { Container, Grid, Header, Segment, Image, Icon, Step, Button, Pagination, Dropdown } from 'semantic-ui-react'
//custom components
import Footer from '../../components/Footer'
//utils
import Service from '../../utils/Service'
//moment
import moment from 'moment'

const data = ''
const industryOptions = [
  {key: 'a', text: 'All', value: 'all'},
  {key: 'b', text: 'Technology', value: 'technology'},
  {key: 'c', text: 'Finance', value: 'finance'},
  {key: 'd', text: 'Entertainment', value: 'entertainment'},
  {key: 'e', text: 'Games & Hobbies', value: 'gamesandhobbies'},
  {key: 'f', text: 'Automotive', value: 'automotive'},
]

//get current date/time
const now = moment()

//styles
const logoStyle = {
  maxHeight: '350px',
  maxWidth: '350px'
}
const headerStyle = {
  backgroundColor: '#065471'
}

//page component
class Market extends Component {
  constructor(props) {
      super(props)
      this.filterCampaigns = this.filterCampaigns.bind(this)
    }

  //state
  state = {
    campaigns: [],
    user: {},
    activePage: 1,
    filteredCampaigns: [],
    industry: ''
  }
  //handle page change
  handlePaginationChange = (e, { activePage }) => this.setState({ activePage })
  //filter by industry
  filterByIndustry = (e, { value }) => this.setState({ industry: value })

  //filter campaigns
  filterCampaigns() {
  return this.state.campaigns.filter(camp => (
    !camp.users.includes(this.state.user.id)
      )
    )
  }


  //component cycle start
  componentDidMount() {
    //get all campaigns
    Service.get('/campaign')
      .then( res => {
        if(res.data) {
          this.setState({campaigns: res.data})
          console.log('all campaigns', this.state.campaigns)
          this.setState({filteredCampaigns: this.filterCampaigns()})
          console.log(this.state.filteredCampaigns)

        }
      })
      .catch( err => console.log('No campaigns.'))
      //check for business
      Service.get('/api/business')
        .then( res => {
          if(res.data.success && res.data.business !== null) {
            this.setState({user: res.data.business})
            console.log('Public business json data: ', this.state.user)
          } else {
            //check for user
            Service.get('/api/user')
              .then(res => {
                if(res.data.success && data.user !== null) {
                  this.setState({user: res.data.user})
                  console.log('Public user json data: ', this.state.user)
                  this.setState({filteredCampaigns: this.filterCampaigns()})
                  console.log(this.state.filteredCampaigns)

                }
              })
              .catch( err => console.log('not a user.'))
          }
        })
        .catch( err => console.log('Not a business.'))
    }

  //handle ad creation & join campaign button
  handleAdCreation = (campaign) => {
    //let { copy, url, startDate, endDate, campaignId } = this.state
    console.log('join campaign click', this.state)
    Service.post('/ad/snatch', {
      //get data from clicked campaign
      userId: this.state.user.id,
      campaignId: campaign._id
    })
    .then(res => {
      console.log(res)
      console.log('success, and then...')
      //redirect to the users' dashboard
      this.props.history.push('/dashboard')
    })
    .catch(err => console.log(err, 'ad creation error.'))
  }

  //determine state from props
  static getDerivedStateFromProps(props) {
    if(!props.loggedIn) {
      props.history.push('/login')
    }
    return null
  }

 render(){
   const { activePage, value } = this.state
   return(
     <div>
       <Segment style={headerStyle}>
           <Image src={Logo} style={logoStyle} fluid centered />
           <Header as='h2' inverted color='grey' textAlign='center'>
             Browse Campaigns on the Market
           </Header>
        </Segment>
     <br/>
     <Container style={{marginTop:'0.5em', marginBottom: '1em'}} >
       <Header style={{textAlign:'center'}}>
         OPEN CAMPAIGNS
       </Header>
       <Header as='h5' style={{textAlign: 'center'}}>
         <Dropdown
            onChange={this.filterByIndustry}
            options={industryOptions}
            placeholder='Filter By Industry'
            selection
            value={value}
          />
      </Header>
     <Grid>
       <Grid.Column mobile={16} tablet={16} computer={16} style={{backgroundColor:'#f8f8f8', marginTop: '1em'}}>
        {this.state.filteredCampaigns.map((campaign, i) =>(
          now.isAfter(moment(campaign.startDate)) && now.isBefore(moment(campaign.endDate)) ?
          campaign.businessId.industry === this.state.industry || this.state.industry === 'all' || this.state.industry === '' ?
         <Segment color='yellow' key={i} clearing>
           <Grid>
             <Grid.Column mobile={16} tablet={12} computer={12}>
           <Header as='h3'>{campaign.headline}</Header>
            <Header as='h5'>Hosted By: {campaign.businessId.name}</Header>
            <Header as='h6'>Industry: {campaign.businessId.industry}</Header>
           <Header as='h5' block compact="true">{campaign.copy}</Header>
           <Header as='h5'> <Icon name='linkify'/><Header.Content><a href={'http://' + campaign.url} target='_blank' >{campaign.url}</a></Header.Content></Header>
             <Step.Group stackable='tablet' size='mini'>
                <Step>
                  <Icon name='calendar check outline' color='green'/>
                  <Step.Content>
                    <Step.Title>Start Date</Step.Title>
                    <Step.Description>
                      {moment(campaign.startDate).format('LLL')}
                    </Step.Description>
                  </Step.Content>
                </Step>
                <Step>
                  <Icon name='calendar minus outline' color='red'/>
                  <Step.Content>
                    <Step.Title>End Date</Step.Title>
                    <Step.Description>{moment(campaign.endDate).format('LLL')}</Step.Description>
                  </Step.Content>
                </Step>
              </Step.Group>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={4} computer={4}>
            <Segment clearing style={{border: 'none', boxShadow: 'none'}}>
            <Header as='h5' > <Icon name='users'/>users on campaign:{campaign.users.length}</Header>
              {this.state.user.handle &&
           <Button  icon='check' content='Join Campaign' labelPosition='right' onClick={ this.handleAdCreation.bind(this,campaign)}></Button> }
           </Segment>
         </Grid.Column>
         </Grid>
       </Segment> :null
        :null
        ))}

        </Grid.Column>
     </Grid>
     <br/>
       <Pagination style={{marginTop: '20px'}}
          activePage={activePage}
          onPageChange={this.handlePaginationChange}
          ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
          firstItem={{ content: <Icon name='angle double left' />, icon: true }}
          lastItem={{ content: <Icon name='angle double right' />, icon: true }}
          prevItem={{ content: <Icon name='angle left' />, icon: true }}
          nextItem={{ content: <Icon name='angle right' />, icon: true }}
          totalPages={3}
            />
     </Container>

   <br />
     <Footer />
     </div>
   )
 }
}

export default Market
