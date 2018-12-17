/* Forms.tsx
 * ================
 *
 * Reusable React components to keep admin UI succint and consistent
 */

import * as React from 'react'
import * as _ from 'lodash'
import { bind } from 'decko'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'

import { extend, pick, capitalize, trim } from '../charts/Util'
import Colorpicker from './Colorpicker'

export class FieldsRow extends React.Component<{}> {
    render() {
        const {props} = this
        return <div className="FieldsRow">
            {props.children}
        </div>
    }
}

export interface TextFieldProps extends React.HTMLAttributes<HTMLInputElement> {
    label?: string
    value: string | undefined
    onValue: (value: string) => void
    onEnter?: () => void
    onEscape?: () => void
    placeholder?: string
    title?: string
    disabled?: boolean
    helpText?: string
    autofocus?: boolean
    required?: boolean
    rows?: number
    softCharacterLimit?: number
}

export class TextField extends React.Component<TextFieldProps> {
    base: React.RefObject<HTMLDivElement>
    constructor(props: TextFieldProps) {
        super(props)
        this.base = React.createRef()
    }

    @bind onKeyDown(ev: React.KeyboardEvent<HTMLInputElement>) {
        if (ev.key === "Enter" && this.props.onEnter) {
            this.props.onEnter()
            ev.preventDefault()
        } else if (ev.key === "Escape" && this.props.onEscape) {
            this.props.onEscape()
            ev.preventDefault()
        }
    }

    componentDidMount() {
        if (this.props.autofocus) {
            const input = this.base.current!.querySelector("input")!
            input.focus()
        }
    }

    render() {
        const { props } = this
        const passthroughProps = pick(props, ['placeholder', 'title', 'disabled', 'required'])

        return <div className="form-group" ref={this.base}>
            {props.label && <label>{props.label}</label>}
            <input className="form-control" type="text" value={props.value||""} onChange={e => this.props.onValue(e.currentTarget.value)} onKeyDown={this.onKeyDown} {...passthroughProps}/>
            {props.helpText && <small className="form-text text-muted">{props.helpText}</small>}
            {props.softCharacterLimit && props.value && <SoftCharacterLimit text={props.value} limit={props.softCharacterLimit}/>}
        </div>
    }
}

export class TextAreaField extends React.Component<TextFieldProps> {
    @bind onChange(ev: React.FormEvent<HTMLTextAreaElement>) {
        const value = ev.currentTarget.value
        this.props.onValue(value)
    }

    render() {
        const { props } = this
        const passthroughProps = pick(props, ['placeholder', 'title', 'disabled', 'label', 'rows'])

        return <div className="form-group">
            {props.label && <label>{props.label}</label>}
            <textarea className="form-control" value={props.value} onChange={this.onChange} rows={5} {...passthroughProps}/>
            {props.helpText && <small className="form-text text-muted">{props.helpText}</small>}
            {props.softCharacterLimit && props.value && <SoftCharacterLimit text={props.value} limit={props.softCharacterLimit}/>}
        </div>
    }
}

export class SearchField extends TextField {

}

export interface NumberFieldProps {
    label?: string,
    value: number | undefined,
    onValue: (value: number|undefined) => void,
    onEnter?: () => void,
    onEscape?: () => void,
    placeholder?: string,
    title?: string,
    disabled?: boolean,
    helpText?: string,
}

export class NumberField extends React.Component<NumberFieldProps> {
    render() {
        const { props } = this

        const textFieldProps = extend({}, props, {
            value: props.value !== undefined ? props.value.toString() : undefined,
            onValue: (value: string) => {
                const asNumber = parseFloat(value)
                props.onValue(isNaN(asNumber) ? undefined : asNumber)
            }
        })

        return <TextField {...textFieldProps}/>
    }
}

export interface SelectFieldProps {
    label?: string,
    value: string | undefined,
    onValue: (value: string) => void,
    options: string[],
    optionLabels?: string[],
    helpText?: string
}

export class SelectField extends React.Component<SelectFieldProps> {
    render() {
        const { props } = this

        const options = props.options.map((opt, i) => {
            return {
                key: opt,
                value: opt,
                text: (props.optionLabels && props.optionLabels[i]) || opt
            }
        })

        return <div className="form-group">
            {props.label && <label>{props.label}</label>}
            <select className="form-control" onChange={e => props.onValue(e.currentTarget.value as string)} value={props.value}>
                {options.map(opt =>
                    <option key={opt.value} value={opt.value}>{opt.text}</option>
                )}
            </select>
            {props.helpText && <small className="form-text text-muted">{props.helpText}</small>}
        </div>
    }
}

export interface NumericSelectFieldProps {
    label?: string,
    value: number|undefined,
    onValue: (value: number) => void,
    options: number[],
    optionLabels?: string[],
    helpText?: string
}

export class NumericSelectField extends React.Component<NumericSelectFieldProps> {
    render() {
        const props = extend({}, this.props, {
            value: this.props.value !== undefined ? this.props.value.toString() : "",
            options: this.props.options.map(opt => opt.toString()),
            onValue: (value: string|undefined) => {
                const asNumber = parseFloat(value as string)
                this.props.onValue(asNumber)
            }
        })
        return <SelectField {...props}/>
    }
}

export interface ToggleProps {
    label: string|JSX.Element
    value: boolean
    onValue: (value: boolean) => void
    disabled?: boolean
}

export class Toggle extends React.Component<ToggleProps> {
    @action.bound onChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.props.onValue(!!e.currentTarget.checked)
    }

    render() {
        const { props } = this
        const passthroughProps = pick(props, ['title', 'disabled']) as any

        return <div className="form-check">
            <label className="form-check-label">
                <input className="form-check-input" type="checkbox" checked={props.value} onChange={this.onChange} {...passthroughProps}/>
                {props.label}
            </label>
        </div>
    }
}

export interface ButtonProps {
    onClick: () => void
    label?: string
}

export class EditableList extends React.Component<{ className?: string }> {
    render() {
        return this.props.children ? <ul {...this.props} className={"list-group" + (this.props.className ? ` ${this.props.className}` : "")}/> : null
    }
}

export interface EditableListItemProps extends React.HTMLAttributes<HTMLLIElement> {
    className?: string
}

export class EditableListItem extends React.Component<EditableListItemProps> {
    render() {
        return <li {...this.props} className={"list-group-item" + (this.props.className ? ` ${this.props.className}` : "")} />
    }
}

@observer
export class ColorBox extends React.Component<{ color: string|undefined, onColor: (color: string|undefined) => void }> {
    @observable.ref isChoosingColor = false

    @action.bound onClick() {
        this.isChoosingColor = !this.isChoosingColor
    }

    render() {
        const { color } = this.props
        const { isChoosingColor } = this

        const style = color !== undefined ? { backgroundColor: color } : undefined

        return <div className="ColorBox" style={style} onClick={this.onClick}>
            {color === undefined && <i className="fa fa-paint-brush"/>}
            {isChoosingColor && <Colorpicker color={color} onColor={this.props.onColor} onClose={() => this.isChoosingColor = false} />}
        </div>
    }
}

export class Section extends React.Component<{ name: string }> {
    render() {
        return <section>
            <h5>{this.props.name}</h5>
            {this.props.children}
        </section>
    }
}

export interface AutoTextFieldProps {
    label?: string
    value: string | undefined
    placeholder?: string
    isAuto: boolean
    helpText?: string
    onValue: (value: string) => void
    onToggleAuto: (value: boolean) => void
    softCharacterLimit?: number
}

@observer
class SoftCharacterLimit extends React.Component<{ text: string, limit: number }> {
    render() {
        const {text, limit} = this.props
        return <div style={text.length > limit ? { color: 'red' } : { color: 'rgba(0,0,0,0.3)' }}>
            {text.length} / {limit}
            {text.length > limit && <p>
                This text is long and may cause rendering issues in smaller viewports.
            </p>}
        </div>
    }
}

@observer
export class AutoTextField extends React.Component<AutoTextFieldProps> {
    render() {
        const {props} = this

        return <div className="form-group AutoTextField">
            {props.label && <label>{props.label}</label>}
            <div className="input-group mb-2 mb-sm-0">
                <input type="text" className="form-control" value={props.value} placeholder={props.placeholder} onChange={e => props.onValue(e.currentTarget.value)}/>
                <div className="input-group-addon" onClick={() => props.onToggleAuto(!props.isAuto)} title={props.isAuto ? "Automatic default" : "Manual input"}>
                    {props.isAuto ? <i className="fa fa-link"/> : <i className="fa fa-unlink"/>}
                </div>
            </div>
            {props.helpText && <small className="form-text text-muted">{props.helpText}</small>}
            {props.softCharacterLimit && props.value && <SoftCharacterLimit text={props.value} limit={props.softCharacterLimit}/>}
        </div>
    }
}

@observer
export class BindString<T extends {[field: string]: any}, K extends keyof T> extends React.Component<{ field: K, store: T, label?: string, placeholder?: string, helpText?: string, textarea?: boolean, softCharacterLimit?: number, disabled?: boolean, rows?: number }> {
    @action.bound onValue(value: string) {
        this.props.store[this.props.field] = (value||undefined) as any
    }

    render() {
        const {props} = this

        const {field, store, label, textarea, ...rest} = props
        const value = props.store[props.field] as string|undefined
        if (textarea)
            return <TextAreaField label={label === undefined ? capitalize(field) : label} value={value||""} onValue={this.onValue} {...rest}/>
        else
            return <TextField label={label === undefined ? capitalize(field) : label} value={value||""} onValue={this.onValue} {...rest}/>
        }
}

@observer
export class BindAutoString<T extends {[field: string]: any}, K extends keyof T> extends React.Component<{ field: K, store: T, auto: string, label?: string, helpText?: string, softCharacterLimit?: number }> {
    @action.bound onValue(value: string) {
        this.props.store[this.props.field] = value as any
    }

    @action.bound onToggleAuto(value: boolean) {
        this.props.store[this.props.field] = (value ? undefined : this.props.auto) as any
    }

    render() {
        const {field, store, label, auto, ...rest} = this.props

        const value = store[field] as string|undefined

        return <AutoTextField label={label||capitalize(field)} value={value === undefined ? auto : value} isAuto={value === undefined} onValue={this.onValue} onToggleAuto={this.onToggleAuto} {...rest}/>
    }
}

export interface AutoFloatFieldProps {
    label?: string
    value: number
    isAuto: boolean
    helpText?: string
    onValue: (value: number|undefined) => void
    onToggleAuto: (value: boolean) => void
}

export class AutoFloatField extends React.Component<AutoFloatFieldProps> {
    render() {
        const { props } = this

        const textFieldProps = extend({}, props, {
            value: props.isAuto ? undefined : props.value.toString(),
            onValue: (value: string) => {
                const asNumber = parseFloat(value)
                props.onValue(isNaN(asNumber) ? undefined : asNumber)
            },
            placeholder: props.isAuto ? props.value.toString() : undefined
        })

        return <AutoTextField {...textFieldProps}/>
    }
}

export interface FloatFieldProps {
    label?: string
    value: number|undefined
    helpText?: string
    onValue: (value: number|undefined) => void
}

export class FloatField extends React.Component<FloatFieldProps> {
    render() {
        const { props } = this

        const textFieldProps = extend({}, props, {
            value: props.value === undefined ? undefined : props.value.toString(),
            onValue: (value: string) => {
                const asNumber = parseFloat(value)
                props.onValue(isNaN(asNumber) ? undefined : asNumber)
            }
        })

        return <TextField {...textFieldProps}/>
    }
}

@observer
export class BindFloat<T extends {[field: string]: any}, K extends keyof T> extends React.Component<{ field: K, store: T, label?: string, helpText?: string }> {
    @action.bound onValue(value: number|undefined) {
        this.props.store[this.props.field] = value as any
    }

    render() {
        const {field, store, label, ...rest} = this.props

        const value = store[field] as number|undefined

        return <FloatField label={label||capitalize(field)} value={value} onValue={this.onValue} {...rest}/>
    }
}

@observer
export class BindAutoFloat<T extends {[field: string]: any}, K extends keyof T> extends React.Component<{ field: K, store: T, auto: number, label?: string, helpText?: string }> {
    @action.bound onValue(value: number|undefined) {
        this.props.store[this.props.field] = value as any
    }

    @action.bound onToggleAuto(value: boolean) {
        this.props.store[this.props.field] = (value ? undefined : this.props.auto) as any
    }

    render() {
        const {field, store, label, auto, ...rest} = this.props

        const value = store[field] as number|undefined

        return <AutoFloatField label={label||capitalize(field)} value={value === undefined ? auto : value} isAuto={value === undefined} onValue={this.onValue} onToggleAuto={this.onToggleAuto} {...rest}/>
    }
}

@observer
export class Modal extends React.Component<{ className?: string, onClose: () => void }> {
    dismissable: boolean = true

    @action.bound onOverlayClick() {
        if (this.dismissable)
            this.props.onClose()
    }

    @bind onModalClick(event: any) {
        event.stopPropagation()
    }

    render() {
        const {props} = this
        return <div className={"modal" + (props.className ? ` ${props.className}` : "")} style={{display: 'block'}} onClick={this.onOverlayClick}>
            <div className="modal-dialog" role="document" onClick={this.onModalClick}>
                <div className="modal-content">
                    {this.props.children}
                </div>
            </div>
        </div>
    }
}

@observer
export class LoadingBlocker extends React.Component<{}> {
    render() {
        return <div className="LoadingBlocker">
            <i className="fa fa-cog fa-spin fa-3x fa-fw"/>
        </div>
    }
}

@observer
export class Pagination extends React.Component<{ totalItems: number, perPage: number }> {
    render() {
        const {totalItems, perPage} = this.props
        const numPages = Math.ceil(totalItems/perPage)
        return <nav>
            <ul className="pagination">
                <li className="page-item"><a className="page-link">Previous</a></li>
                {_.range(1, numPages+1).map(pageNum =>
                    <li className="page-item"><a className="page-link">{pageNum}</a></li>
                )}
                <li className="page-item"><a className="page-link">Next</a></li>
            </ul>
        </nav>

    }
}

const timeago = require('timeago.js')()

@observer
export class Timeago extends React.Component<{ time: Date }> {
    render() {
        return this.props.time ? timeago.format(this.props.time) : ""
    }
}