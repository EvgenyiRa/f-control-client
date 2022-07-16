import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import {getParamForAPI,getParamDiff} from '../system.js';
import {apiStr} from '../ws.js';

import $ from 'jquery';

class TableAPI extends React.Component {
    constructor(props) {
        super(props);
        this.getRowsByAPI = this.getRowsByAPI.bind(this);
        this.state = {
          rows: [],
          selectRow:undefined,
          selectRowFull:undefined,
          columns:props.obj.columns,
          rowStyle:(!!props.obj.rowStyle)? props.obj.rowStyle:{},
          hiddenRowKeys:(!!props.obj.hiddenRowKeys)? props.obj.hiddenRowKeys:[],
        };
        this.pr_tableSQLdopAction_vis=false;
        this.ul_oda=undefined;
        this.panelScroll=() => {
          if (this.pr_tableSQLdopAction_vis) {
            var li_v=$(this.ul_oda).closest('li'),
                this_top=$(li_v).offset().top+30,
                this_left=$(li_v).offset().left+3;
            $(this.ul_oda).css({'left':this_left+'px','top':this_top+'px'});
          }
       }

       this.rowEvents={};
        if (!!this.props.obj.rowEvents) {
            this.rowEvents={...this.props.obj.rowEvents};
            if (!!this.rowEvents.onClick) {
                this.rowEvents.onClick=(e, row, rowIndex) => {
                    this.props.obj.rowEvents.onClick(e, row, rowIndex,this);
                }
            }
            if (!!this.rowEvents.onDoubleClick) {
                this.rowEvents.onDoubleClick=(e, row, rowIndex) => {
                    this.props.obj.rowEvents.onDoubleClick(e, row, rowIndex,this);
                }
            }
            if (!!this.rowEvents.onContextMenu) {
                this.rowEvents.onContextMenu=(e, row, rowIndex) => {
                    this.props.obj.rowEvents.onContextMenu(e, row, rowIndex,this);
                }
            }
            if (!!this.rowEvents.onMouseEnter) {
                this.rowEvents.onMouseEnter=(e, row, rowIndex) => {
                    this.props.obj.rowEvents.onMouseEnter(e, row, rowIndex,this);
                }
            }
            if (!!this.rowEvents.onMouseOver) {
                this.rowEvents.onMouseOver =(e, row, rowIndex) => {
                    this.props.obj.rowEvents.onMouseOver(e, row, rowIndex,this);
                }
            }
            if (!!this.rowEvents.onMouseOut) {
                this.rowEvents.onMouseOut =(e, row, rowIndex) => {
                    this.props.obj.rowEvents.onMouseOut(e, row, rowIndex,this);
                }
            }
        }

        if (!!this.props.obj.selectRowProp) {
            this.selectRowProp={...this.props.obj.selectRowProp};
            this.selectRowProp.selected=this.state.selectRow;
            if (!!this.props.obj.selectRowProp.onSelect) {
                this.selectRowProp.onSelect=(row, isSelect, rowIndex, e) => {
                    this.props.obj.selectRowProp.onSelect(row, isSelect, rowIndex, e, this);
                }
            }
            if (!!this.props.obj.selectRowProp.onSelectAll) {
                this.selectRowProp.onSelectAll=(isSelect, rows, e) => {
                    this.props.obj.onSelectAll.onSelect(isSelect, rows, e, this);
                }
            }
        }
        else {
            this.selectRowProp=undefined;
        }

        if (!!this.props.obj.paginationFactory) {
          if (!!this.props.obj.paginationOptions) {
            this.paginationOptions={...this.props.obj.paginationOptions};
            if (!!this.props.obj.paginationOptions.onPageChange) {
                this.paginationOptions.onPageChange=(page, sizePerPage) => {
                    this.props.obj.paginationOptions.onPageChange(page, sizePerPage, this);
                }
            }
            if (!!this.props.obj.paginationOptions.onSizePerPageChange) {
                this.paginationOptions.onSizePerPageChange=(page, sizePerPage) => {
                    this.props.obj.paginationOptions.onSizePerPageChange(sizePerPage, page, this);
                }
            }
            this.pagination=this.props.obj.paginationFactory(this.paginationOptions);
          }
          else {
            this.pagination=this.props.obj.paginationFactory();
          }
        }
        else {
            this.pagination=undefined;
        }

        if (!!this.props.obj.filterFactory) {
            if (!!this.props.obj.filterFactoryIn) {
                this.filter=this.props.obj.filterFactory(this.props.obj.filterFactoryIn);
            }
            else {
                this.filter=this.props.obj.filterFactory();
            }
        }
        else {
            this.filter=undefined;
        }

        if (!!this.props.obj.cellEditFactory) {
          if (!!this.props.obj.cellEditOptions) {
            this.cellEditOptions={...this.props.obj.cellEditOptions};
            if (!!this.cellEditOptions.onStartEdit) {
                this.cellEditOptions.onStartEdit=(row, column, rowIndex, columnIndex) => {
                  this.props.obj.cellEditOptions.onStartEdit(row, column, rowIndex, columnIndex, this);
                }
            }
            if (!!this.cellEditOptions.beforeSaveCell) {
                this.cellEditOptions.beforeSaveCell=(oldValue, newValue, row, column) => {
                  this.props.obj.cellEditOptions.beforeSaveCell(oldValue, newValue, row, column, this);
                }
            }
            if (!!this.cellEditOptions.afterSaveCell) {
                this.cellEditOptions.afterSaveCell=(oldValue, newValue, row, column) => {
                  this.props.obj.cellEditOptions.afterSaveCell(oldValue, newValue, row, column, this);
                }
            }
            this.state.cellEdit=this.props.obj.cellEditFactory(this.cellEditOptions);
          }
          else {
              this.state.cellEdit=this.props.obj.cellEditFactory();
          }
        }
        else {
          this.state.cellEdit=undefined;
        }
    }

    getRowsByAPI() {
      if (!!this.props.obj.stateLoadObj) {
        this.props.obj.stateLoadObj.current.handleShow();
      }
      const thisV=this;
      var data = {params:{}};
      const parForAPI=getParamForAPI(thisV.props.obj);
      let prOk=true;
      if (!!thisV.props.obj.beforeGetAPI) {
          prOk=thisV.props.obj.beforeGetAPI(thisV,parForAPI);
      }
      if (prOk) {
        const setRes=(res)=>{
          thisV.setState({rows: res});
          if (!!thisV.props.obj.afterLoadRows) {
              thisV.props.obj.afterLoadRows(thisV,res);
          }
          if (!!this.props.obj.stateLoadObj) {
            this.props.obj.stateLoadObj.current.handleHide();
          }
        }
        const getApi=()=>{
          //console.log(apiStr);
          if (!!this.props.obj.apiMethod) {
            apiStr[thisV.props.obj.apiMethod](parForAPI).then((res)=>{
                setRes(res);
            });
          }
          else if (!!this.props.obj.apiDataFunc) {
              const res=this.props.obj.apiDataFunc(this.props.obj.apiData,parForAPI,this);
              setRes(res);
          }
        }
        if ((typeof apiStr[thisV.props.obj.apiMethod]==='function') || (!!thisV.props.obj.apiDataFunc)) {
            getApi();
        }
        else if (typeof thisV.props.obj.apiMethod==='string') {
            const timerId = setInterval(() => {
              if (typeof apiStr[thisV.props.obj.apiMethod]==='function') {
                clearInterval(timerId);
                getApi();
              }
            }, 100);
        }

      }
    }

    componentDidMount() {
        if ((!!!this.props.obj.parParentID) & (!!this.props.obj.apiMethod)) {
            this.getRowsByAPI();
        }
        let thisV=this;
        if (!!this.props.obj.filterFactory) {
          //добавляем кнопку поиска, по-умолчанию скрываем все поля фильтрации
          var b_tab=$('div.react-bootstrap-table table#'+this.props.obj.tab_id).closest('div');
          if ($(b_tab).find('button.react-bootstrap-table-but-searche').length===0) {
            var bt_label=$(b_tab).find('th label.filter-label');
            $(b_tab).append('<button class="react-bootstrap-table-but-searche" type="button">&#128269;</button>');
            $(bt_label).hide();
            $(b_tab).on("click", "button.react-bootstrap-table-but-searche", function() {
              if ($(bt_label).first().is(':visible')) {
                  $(bt_label).hide();
              }
              else {
                  $(bt_label).show();
              }
            });
          }
        }
        //Добавляем панель действий если есть подъодящие элементы
        if ((!!this.props.obj.addRow) || (!!this.props.obj.deleteRow)
            || (!!this.props.obj.dopAction) || (!!this.props.obj.editRow)) {
          var b_tab=$('div.react-bootstrap-table table#'+this.props.obj.tab_id).closest('div');
          $(b_tab).prepend('<ul class="ul_cons top-level" style="margin:0.3em 0 0.3em 0;padding: 0;">');
          var ul_v=$(b_tab).find('ul.ul_cons.top-level');
          if (!!this.props.obj.addRow) {
              $(ul_v).append(`<li id="`+this.props.obj.tab_id+`" class="li_cons li_cons_top tableSQLaddRow" style="background: none;">
                                  <a id="`+this.props.obj.tab_id+`" title="Добавить строку" class="tableSQLaddRow">
                                      <img src="`+require('../img/add.png')+`" style="height:1.8em;width:auto;">
                                  </a>
                              </li>`);
              $(ul_v).find('li.tableSQLaddRow').click(()=>thisV.props.obj.addRow(thisV));
          }
          if (!!this.props.obj.editRow) {
              $(ul_v).append(`<li id="`+this.props.obj.tab_id+`" class="li_cons li_cons_top tableSQLeditRow" style="background: none;">
                                  <a id="`+this.props.obj.tab_id+`" title="Редактировать строку" class="tableSQLeditRow">
                                      <img src="`+require('../img/edit.png')+`" style="height:1.8em;width:auto;">
                                  </a>
                              </li>`);
              $(ul_v).find('li.tableSQLeditRow').click(()=>thisV.props.obj.editRow(thisV));
          }
          if (!!this.props.obj.deleteRow) {
              $(ul_v).append(`<li id="`+this.props.obj.tab_id+`" class="li_cons li_cons_top tableSQLdeleteRow" style="background: none;">
                                  <a id="`+this.props.obj.tab_id+`" title="Удалить строку" class="tableSQLdeleteRow">
                                      <img src="`+require('../img/rep_del.png')+`" style="height:1.8em;width:auto;">
                                  </a>
                              </li>`);
              $(ul_v).find('li.tableSQLdeleteRow').click(()=>thisV.props.obj.deleteRow(thisV));
          }
          if (!!this.props.obj.dopAction) {
              $(ul_v).append(`<li id="`+this.props.obj.tab_id+`" class="li_cons li_cons_top tableSQLdopActionBlok" style="background: none;">
                                <img src="`+require('../img/actions.png')+`" style="height:1.8em;width:auto;" title="Доп.действия">
                                <ul class="tableSQLdopAction ul_cons second-level"></ul>
                              </li>`);

              $(ul_v).find('li.li_cons.li_cons_top.tableSQLdopActionBlok[id="'+this.props.obj.tab_id+'"]').click(function() {
                  thisV.ul_oda=$(this).find('ul.tableSQLdopAction');
                  if (!$(thisV.ul_oda).is(':visible')) {
                      $(thisV.ul_oda).show();
                      var this_top=$(this).offset().top+30,
                          this_left=$(this).offset().left+3;
                      $(thisV.ul_oda).css({'left':this_left+'px','top':this_top+'px'});
                      thisV.pr_tableSQLdopAction_vis=true;
                  }
                  else {
                      $(thisV.ul_oda).hide();
                      thisV.pr_tableSQLdopAction_vis=false;
                  }
              });

              //$('div#root').on('scroll','main',this.panelScroll);
              $('main').bind('scroll', this.panelScroll);

              var ul_sl=$(ul_v).find('ul.tableSQLdopAction.ul_cons.second-level');
              this.props.obj.dopAction.forEach((item) => {
                $(ul_sl).append(`<li class="li_cons tableSQLdopAction" id="`+item.id+`">
                                    <a id="`+item.id+`">`+item.label+`</a>
                                 </li>`);
                $(ul_sl).find('li.tableSQLdopAction[id="'+item.id+'"]').click(()=>item.callback(thisV));
              })
          }
      }
      if (!!this.props.obj.componentDidMount) {
          this.props.obj.componentDidMount(this);
      }
    }

    componentWillUnmount() {
      if (!!this.props.obj.dopAction) {
          $('main').unbind('scroll', this.panelScroll);
      }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Популярный пример (не забудьте сравнить пропсы):
        //console.log(this.props);
        if (getParamDiff(this.props.obj,prevProps.obj)) {
            this.getRowsByAPI();
        }
        else if ((!!this.props.obj.apiData) & (!!this.props.obj.apiDataFunc)) {
            if (this.props.obj.apiData!==prevProps.obj.apiData) {
                this.getRowsByAPI();
            }
        }
        if (!!this.props.obj.componentDidUpdate) {
            this.props.obj.componentDidUpdate(this,prevProps, prevState, snapshot);
        }
      }

    render() {
      const NoDataIndication = () => (
        <div className="spinner">
          Отсутствуют данные для отображения
        </div>
      );
        return (
              <BootstrapTable
                id={ this.props.obj.tab_id }
                data={this.state.rows}
                keyField={ this.props.obj.keyField}
                columns={ this.state.columns }
                classes={ this.props.obj.tableContainerClass}
                bodyClasses={ this.props.obj.bodyClasses}
                selectRow={ this.selectRowProp }
                pagination={ this.pagination }
                noDataIndication={ () => <NoDataIndication /> }
                filter={ this.filter }
                rowEvents={ this.rowEvents }
                rowStyle={ this.state.rowStyle }
                hiddenRows={ this.state.hiddenRowKeys }
                cellEdit={this.state.cellEdit}
              />


        );
    }
}

export default TableAPI;
