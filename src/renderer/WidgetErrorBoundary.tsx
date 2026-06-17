import React from 'react';

interface Props {
	children: React.ReactNode;
	/** Widget identity, used to make the log line actionable. */
	type?: string;
	id?: string;
}

interface State {
	error: Error | null;
}

/**
 * Isolates a single widget's render failure.
 *
 * Screens here are described by server-sent schema, so the shape of a widget's
 * props is decided at runtime by a payload this package does not control. A
 * widget whose component throws during render would otherwise unmount the
 * entire React tree above it — one malformed item in a response blanks the
 * whole screen.
 *
 * Rendering `null` degrades that to a missing widget, which matches what
 * WidgetRenderer already does when a widget arrives with no props at all.
 *
 * Only render-phase errors are caught. A widget that throws inside an event
 * handler or a promise still needs its own handling.
 */
class WidgetErrorBoundary extends React.Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error) {
		const { type, id } = this.props;
		// Same shape as WidgetRenderer's skipped-widget warning, so both
		// failure modes read alike in a log.
		console.warn(
			'ERROR: WIDGET RENDER FAILED',
			`type-> ${type} id-> ${id} error-> ${error.message}`,
		);
	}

	// Return type is left to inference, matching the other renderers here. An
	// explicit React.ReactElement annotation resolves against the nested
	// @types/react under @types/react-native, whose ReactPortal requires
	// `children`, and the mismatch surfaces as TS2786 at the JSX call site.
	render() {
		if (this.state.error) return null;
		return <>{this.props.children}</>;
	}
}

export default WidgetErrorBoundary;
