import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { StreamElement, StreamTypeEnum, AddStream } from '../../../states/streams.state';
import { OpenThreadEvent, ToolsService } from '../../../services/tools.service';
import { StreamStatusesComponent } from '../stream-statuses/stream-statuses.component';
import { AccountInfo } from '../../../states/accounts.state';

@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.component.html',
    styleUrls: ['./hashtag.component.scss']
})
export class HashtagComponent implements OnInit, OnDestroy {
    @Input() refreshEventEmitter: EventEmitter<any>;
    @Input() goToTopEventEmitter: EventEmitter<any>;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    private _hashtagElement: StreamElement;
    @Input() 
    set hashtagElement(hashtagElement: StreamElement){
        this._hashtagElement = hashtagElement;
        this.lastUsedAccount = this.toolsService.getSelectedAccounts()[0];
    }
    get hashtagElement(): StreamElement{
        return this._hashtagElement;
    }
   

    @ViewChild('appStreamStatuses') appStreamStatuses: StreamStatusesComponent;

    goToTopSubject: Subject<void> = new Subject<void>();

    private lastUsedAccount: AccountInfo;
    private refreshSubscription: Subscription;
    private goToTopSubscription: Subscription;

    columnAdded: boolean;

    constructor(
        private readonly store: Store,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
        if(this.refreshEventEmitter) {
            this.refreshSubscription = this.refreshEventEmitter.subscribe(() => {
                this.refresh();
            })
        }

        if(this.goToTopEventEmitter) {
            this.goToTopSubscription = this.goToTopEventEmitter.subscribe(() => {
                this.goToTop();
            })
        }
    }

    ngOnDestroy(): void {
        if(this.refreshSubscription) this.refreshSubscription.unsubscribe();
        if (this.goToTopSubscription) this.goToTopSubscription.unsubscribe();
    }

    goToTop(): boolean {
        this.goToTopSubject.next();
        return false;
    }

    addColumn(event): boolean {
        event.stopPropagation();

        const hashtag = this.hashtagElement.tag;
        const newStream = new StreamElement(StreamTypeEnum.tag, `${hashtag}`, this.lastUsedAccount.id, hashtag, null, null, this.lastUsedAccount.instance);
        this.store.dispatch([new AddStream(newStream)]);

        this.columnAdded = true;

        return false;
    }

    refresh(): any {
        this.lastUsedAccount = this.toolsService.getSelectedAccounts()[0];
        this.appStreamStatuses.refresh();
    }

    browseAccount(account: string) {
        this.browseAccountEvent.next(account);
    }

    browseHashtag(hashtag: string) {
        if(this.hashtagElement.tag === hashtag) return false;

        this.browseHashtagEvent.next(hashtag);
    }

    browseThread(openThreadEvent: OpenThreadEvent): void {
        this.browseThreadEvent.next(openThreadEvent);
    }
}
