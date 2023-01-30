import React from "react"
import {
  MDBRow,
  MDBCol,
  MDBInput,
  MDBCheckbox,
  MDBBtn,
  MDBIcon,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBDropdownItem,
} from "mdb-react-ui-kit"
import "mdb-react-ui-kit/dist/css/mdb.min.css"

export default function MDForm() {
  let loginRegisterActive = "room"

  function handleLoginRegisterClick(inputType) {
    console.log(inputType)
    loginRegisterActive = inputType
  }

  return (
    <div>
      <MDBTabs pills justify className='mb-3'>
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => handleLoginRegisterClick("room")}
            active={loginRegisterActive === "room"}
          >
            Classroom
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => handleLoginRegisterClick("class")}
            active={loginRegisterActive === "class"}
          >
            Class code
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      <MDBTabsContent>
        <MDBTabsPane show={loginRegisterActive === "room"}>
          <form>
            <MDBDropdown>
              <MDBDropdownToggle tag='a' className='mb-4'>
                Quarter
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                <MDBDropdownItem link>Fall 22</MDBDropdownItem>
                <MDBDropdownItem link>Winter 23</MDBDropdownItem>
                <MDBDropdownItem link>Spring 23</MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
            <MDBInput
              className='mb-4'
              type='input'
              id='form7Example2'
              label='Room'
            />
            <select name='quarter' id='quarter'>
              <option value='f22'>Fall 22</option>
              <option value='w23'>Winter 23</option>
              <option value='s23'>Spring 23</option>
            </select>
            <MDBBtn type='submit' className='mb-4' block>
              Search for classroom
            </MDBBtn>
          </form>
        </MDBTabsPane>
        <MDBTabsPane show={loginRegisterActive === "class"}>
          <form>
            <MDBDropdown>
              <MDBDropdownToggle tag='a' className='mb-4'>
                Quarter
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                <MDBDropdownItem link>Fall 22</MDBDropdownItem>
                <MDBDropdownItem link>Winter 23</MDBDropdownItem>
                <MDBDropdownItem link>Spring 23</MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
            <MDBInput
              className='mb-4'
              type='quarter'
              id='form7Example1'
              label='Quarter: '
            />
            <MDBInput
              className='mb-4'
              type='input'
              id='form7Example2'
              label='Class code'
            />

            <MDBBtn type='submit' className='mb-4' block>
              Search
            </MDBBtn>
          </form>
        </MDBTabsPane>
      </MDBTabsContent>
    </div>
  )
}
