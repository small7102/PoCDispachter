import axios from 'axios'
import {URL} from './apiCode'

console.log(URL)

export function getGroupList(data){
  return axios({
      baseURL: '/api',
      url: `${URL}/data/grps`,
      params: data
  })
}