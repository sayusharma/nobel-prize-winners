import React from 'react';
import { useState,useEffect } from 'react';
import styledComponents from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Table } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import { faArrowRight,faArrowLeft, faMagnifyingGlass, faFile, faFilter, faClose} from '@fortawesome/free-solid-svg-icons';
import './Main.css';
function Main() {
    //all states
    const [currentdata,setCurrentdata] = useState([]);
    const [alert,setAlert] = useState([]);
    const [data,setData] = useState([]);
    const [page,setPage] = useState(0);
    const [pages,setPages] = useState(0);
    const [perPage,setPerPage] = useState(10);
    const [firstTime,setFirstTime] = useState(false);

    let yamlObj;
    let objJson;
    const YAML = require('json-to-pretty-yaml');

    //items\winners to render
    let items = currentdata.slice(page * perPage, (page + 1) * perPage);
    let prizes = items.map((item)=>{
        return(
            <tr key={item.id}>
                <td>{item.year}</td>
                <td>{item.category}</td>
                <td>{findAllWinners(JSON.stringify(item.laureates))}</td>
            </tr>
        );
    });

    useEffect(()=>{
        setFirstTime(false);
    },[]);

    function onFileNameSubmit(e){
        e.preventDefault();
        const filename = document.getElementById('#filename').value;
        fetch(filename).then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Something went wrong');
          })
          .then((responseJson) => {
                setCurrentdata(responseJson.prizes); 
                setData(responseJson.prizes); 
                objJson = responseJson.prizes;
                ////console.log('daraaa : '+ JSON.stringify(objJson));
                // //console.log(perPage);
                setPages(Math.floor(objJson.length / perPage));
                // //console.log(Math.floor(objJson.length / perPage));
                // //console.log(pages+' PAGES' + page + '  ' + perPage);
                setFirstTime(true);
          })
          .catch((error) => {
            setFirstTime(false);
            //console.log(error);
            //showAlertBox('AYUSH');
            showAlert('Please enter a valid filename');
          });
    }
    function convertJsonToYaml(e){
        e.preventDefault();
        const filename = document.getElementById('#filename').value;
        fetch(filename).then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Something went wrong');
          })
          .then((responseJson) => {
            yamlObj = YAML.stringify(responseJson);
            //console.log(yamlObj);
            const elem = document.createElement('a');
            const file = new Blob([yamlObj],{
                type:"text/yaml;charset=utf-8"
            });
            elem.href = URL.createObjectURL(file);
            elem.download = "export.yaml";
            document.body.appendChild(elem);
            elem.click();
          })
          .catch((error) => {
            //console.log(error);
            showAlert('Please enter a valid filename');
          });
    }
    function generateNames(data){
        let arr = [];
        for(let i=0;i<data.length;i++){
            let str ='';
            const d = data[i].laureates;
            if(typeof(d) !== 'undefined'){
               // //console.log(d);
                for(let j=0;j<d.length;j++){
                   // //console.log('FINE AT ',i + ' ',j);
                    ////console.log(d[j]);
                    if(typeof(d[j]) !== 'undefined'){
                        if(typeof(d[j].firstname) !== 'undefined'){
                            str = str + d[j].firstname;
                        }
                        if(typeof(d[j].surname) !== 'undefined'){
                            str = str + ' ' + d[j].surname;
                        }
                        str = str + ', ';
                    }
                }
                ////console.log(str);
                arr.push(str);
            }else{
               arr.push('');
            }
        }
        return arr;
    }
    function findAllWinners(json){
        //console.log(pages,' ' + page);
        let str = '';
        if(typeof(json) !== 'undefined'){
            ////console.log('len:'+json.length + ':  '+ JSON.parse(json));
            json = JSON.parse(json);
            json.forEach((obj)=>{
                if(typeof(obj) !== 'undefined'){
                    if(typeof(obj.firstname) !== 'undefined'){
                        str = str + obj.firstname;
                    }
                    if(typeof(obj.surname) !== 'undefined'){
                        str = str + ' ' + obj.surname;
                    }
                    str = str + ', ';
                }
            });
            return str.substring(0,str.length-2);
        }else{
            return str;
        }
        
    }
    function changeItemsPerPage(e){
        const newValue = parseInt(e.target.text);
        setPerPage(newValue);
        setPage(0);
        setPages(Math.floor(currentdata.length / newValue));
    }

    function jumpToNextPage(e){
        //console.log('page:',page);
        if(typeof(page)!='undefined'){
            //console.log(page,+' '+(page+1) + ' ' + pages);
            if(page == pages){
                showAlert('You have reached the LAST page');
            }else{
                setPage(page+1);
            }
        }else{
            showAlert('Cannot go the NEXT page');
        }
    }
    function jumpToPrevPage(e){
        //console.log('page:',page);
        if(page){
            if(page==0){
                showAlert('You have reached the FIRST page');
            }else{
                setPage(page-1);
            }
        }else{
            showAlert('Cannot go the PREV page');
        }
    }
    function onSearch(){
        const val = document.getElementById('#search').value;
        if(val==''){
            setCurrentdata(data);
            setPages(Math.floor(data.length / perPage));
        }else{
            let arr = [];
            let names = generateNames(data);
            for(let i=0;i<names.length;i++){
                if(names[i].toLowerCase().includes(val.toLowerCase())){
                    //console.log(data[i]);
                    arr.push(data[i]);
                }
            }
            setPages(Math.floor(arr.length / perPage));
            setCurrentdata(arr);
        }
    }
    const showFilterPopup = ()=>{
        const fil = document.getElementById('#filterPopup');
        if(fil.style.display=='none'){
            fil.style.display = 'block';
            document.getElementById('#yearText').value = '';
            document.getElementById('#categoryText').value = '';
        }else{
            fil.style.display = 'none';
        }
    }
    const filterResults = ()=>{
        const year = document.getElementById('#yearText').value;
        const category = document.getElementById('#categoryText').value;
        if(!year && !category){
            showAlert('BOTH Year and Category cannot be empty');
        }
        else{
            //console.log(toString(year));
            let newData = [];
            for(let i=0;i<currentdata.length;i++){
                if(currentdata[i].year == year || currentdata[i].category == category){
                    newData.push(currentdata[i]);
                }
            }
            setCurrentdata(newData);
            setPages(Math.floor(newData.length / perPage));
            showFilterPopup();
        }
    }

    const resetTable = ()=>{
        document.getElementById('#search').value = '';
        setCurrentdata(data);
        setPage(0);
        setPages(Math.floor(data.length / perPage));
    }

    const resetFilter=()=>{
        document.getElementById('#yearText').value = '';
        document.getElementById('#categoryText').value = '';
        setCurrentdata(currentdata);
        setPages(Math.floor(currentdata.length / perPage));
    }

    const showAlert=(text)=>{
        const adiv = document.getElementById('#alert-container');
        adiv.style.display = 'block';
        const main = document.getElementById('#main-body-container');
        main.classList.add('faded');
        setAlert(text);
    }

    const closeAlert=()=>{
        const adiv = document.getElementById('#alert-container');
        adiv.style.display = 'none';
        const main = document.getElementById('#main-body-container');
        main.classList.remove('faded');
        setAlert('');
    }
  return (
      <>
        <div id='#alert-container' style={{display:'none'}}>
            <div class="alert alert-danger my-alert" role="alert">
                {alert}
                <button onClick={closeAlert} className='float-right btn-container'><FontAwesomeIcon icon={faClose} className="fa-lg"></FontAwesomeIcon></button>
            </div>
        </div>
        <div className='main-body' id='#main-body-container'>
            <Header>Nobel Prizes</Header>
            <div className="input-group mb-3">
                <div className="input-group-prepend">
                    <span className="input-group-text"><FontAwesomeIcon icon={faFile}></FontAwesomeIcon></span>
                </div>
                <input type="text" id="#filename" className="form-control" placeholder="Filename with extension, for eg: prize.json"/>
                <Button id='#btn-filename' style={{margin:'0 1rem'}} onClick={onFileNameSubmit} variant='primary'>Show Prizes</Button>
                <Button onClick={convertJsonToYaml} id="#exportyaml" variant='secondary'>Export YAML</Button>
            </div>
            <div id='#main-container' hidden={!firstTime}>
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text"><FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon></span>
                    </div>
                    <input type="text" id="#search" className="form-control" placeholder="Search by name of winners"/>
                    <Button style={{margin:'0 0 0 1rem'}} onClick={onSearch} variant='primary'>Search Winners</Button>
                </div>
                <div>
                    <Dropdown style={{display:'inline-block',margin:'0 1rem 1rem 0'}}>
                        <Dropdown.Toggle variant="success">
                            {perPage}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={changeItemsPerPage}>
                                10
                            </Dropdown.Item>
                            <Dropdown.Item onClick={changeItemsPerPage}>
                                20
                            </Dropdown.Item>
                            <Dropdown.Item onClick={changeItemsPerPage}>
                                30
                            </Dropdown.Item>
                            <Dropdown.Item onClick={changeItemsPerPage}>
                                40
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <span style={{fontSize:'1.2rem'}}>Showing {page+1} of {pages+1} pages</span>
                    <button className='btn-container' onClick={showFilterPopup}>
                        <FontAwesomeIcon icon={faFilter} className="fa-lg"></FontAwesomeIcon>
                    </button>
                    <div className="animation-container" style={{display:'none'}} id="#filterPopup">
                        <div className="form-container">
                            <div className="input-group mb-1">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon></span>
                                    </div>
                                    <input type="text" id="#yearText" className="form-control" placeholder="Search by year"/> 
                            </div>
                            <div className='or'>or</div>
                            <div className="input-group mb-1">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon></span>
                                    </div>
                                    <input type="text" id="#categoryText" className="form-control" placeholder="Search by category"/> 
                            </div>
                            <div>
                                <Button onClick={filterResults} variant='primary' className='mt-1'>Filter</Button>
                                <Button onClick={resetFilter} variant='info' className='mt-1 ml-2'>Reset</Button>
                            </div>
                            
                        </div>
                    </div>
                    <Button onClick={resetTable} variant='info' className='mt-1 float-right'>Reset Table</Button>
                </div>
                <Table className={'table table-striped'}>
                    <thead className='thead-dark'>
                        <tr>
                            <th style={{width:'250px'}}>Year</th>
                            <th style={{width:'400px'}}>Category</th>
                            <th>Lauretes</th>
                        </tr>
                    </thead>    
                    <tbody>
                        {prizes}
                    </tbody>
                </Table>
                <div>
                    <button id='#btn_prev' onClick={jumpToPrevPage} className="arrow-left">
                        <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                    </button>
                    <span>    </span>
                    <button id='#btn_next' onClick={jumpToNextPage} className="arrow-right">
                        <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
                    </button>
                </div>
            </div>

        </div>
      </>
      
  )
}

const Header = styledComponents.h1`
    font-size:2rem;
    font-weight:600;
    width:100%;
    text-align:center;
`;

export default Main